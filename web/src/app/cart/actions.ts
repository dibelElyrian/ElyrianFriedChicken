'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { CartItem } from '@/types'

export async function placeOrder(
  cartItems: CartItem[],
  userEmail: string,
  userId: string | null,
  pointsToRedeem: number,
  scheduledFor: string | null
) {
  try {
    // 1. Validate inputs
    if (!cartItems || cartItems.length === 0) {
      return { error: 'Cart is empty' }
    }

    // 2. Calculate total on server side
    const itemIds = cartItems.map(i => i.id)
    const { data: menuItems, error: menuError } = await supabaseAdmin
      .from('menu_items')
      .select('id, price, is_available, name')
      .in('id', itemIds)
    
    if (menuError || !menuItems) {
      return { error: 'Failed to validate menu items' }
    }

    let calculatedTotal = 0
    const orderItemsData = []

    for (const item of cartItems) {
      const menuItem = menuItems.find(m => m.id === item.id)
      if (!menuItem) continue

      if (!menuItem.is_available) {
        return { error: `Sorry, ${menuItem.name} is currently sold out.` }
      }
      
      const price = menuItem.price
      calculatedTotal += price * item.quantity
      
      orderItemsData.push({
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_time: price
      })
    }

    // 3. Handle Points Deduction
    if (pointsToRedeem > 0) {
      if (!userId) {
        return { error: 'Cannot redeem points without user ID' }
      }

      // Check user balance
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('points')
        .eq('id', userId)
        .single()
      
      if (profileError || !profile) {
        return { error: 'Failed to fetch user profile' }
      }

      if (profile.points < pointsToRedeem) {
        return { error: 'Insufficient points' }
      }

      // Deduct points using the secure RPC or direct update (since we are admin)
      // We'll use the RPC to be consistent with our new security model, 
      // but direct update works too since we are service_role.
      // Let's use direct update for simplicity as RPC might not be applied yet if user didn't run migration.
      // Wait, if I use direct update, the trigger might block it?
      // The trigger checks `if auth.role() = 'authenticated'`.
      // `supabaseAdmin` uses `service_role`. So the trigger should allow it.
      
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ points: profile.points - pointsToRedeem })
        .eq('id', userId)
      
      if (updateError) {
        return { error: 'Failed to deduct points' }
      }
    }

    const finalTotal = Math.max(0, calculatedTotal - pointsToRedeem)

    // 4. Create Order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_email: userEmail,
        user_id: userId,
        total_amount: finalTotal,
        points_redeemed: pointsToRedeem,
        status: 'pending',
        payment_method: 'cash',
        payment_status: 'unpaid',
        scheduled_for: scheduledFor
      })
      .select()
      .single()

    if (orderError) {
      // Rollback points
      if (pointsToRedeem > 0 && userId) {
         await supabaseAdmin.rpc('increment_points', { user_id: userId, amount: pointsToRedeem })
      }
      return { error: 'Failed to create order' }
    }

    // 5. Create Order Items
    const itemsToInsert = orderItemsData.map(item => ({
      ...item,
      order_id: order.id
    }))

    const { error: itemsError } = await supabaseAdmin
      .from('order_items')
      .insert(itemsToInsert)

    if (itemsError) {
      // Rollback everything
      await supabaseAdmin.from('orders').delete().eq('id', order.id)
      if (pointsToRedeem > 0 && userId) {
         await supabaseAdmin.rpc('increment_points', { user_id: userId, amount: pointsToRedeem })
      }
      return { error: 'Failed to create order items' }
    }

    return { success: true, orderUuid: order.order_uuid }
  } catch (error) {
    console.error('Place order error:', error)
    return { error: 'Internal server error' }
  }
}
