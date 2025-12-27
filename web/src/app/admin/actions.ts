'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = formData.get('password')
  const correctPassword = process.env.ADMIN_PASSWORD

  if (password === correctPassword) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', 'true', { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    redirect('/admin')
  } else {
    return { error: 'Invalid password' }
  }
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/admin/login')
}

export async function getOrders(
  filter: 'today' | 'upcoming' | 'all' = 'today',
  page: number = 1,
  pageSize: number = 20
) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  let query = supabaseAdmin
    .from('orders')
    .select('*, items:order_items(quantity, menu_item:menu_items(name))', { count: 'exact' })
    .order('created_at', { ascending: false })

  const today = new Date().toISOString().split('T')[0]

  if (filter === 'today') {
    // Show orders scheduled for today OR orders created today (fallback for old data)
    query = query.or(`scheduled_for.eq.${today},and(scheduled_for.is.null,created_at.gte.${today}T00:00:00)`)
  } else if (filter === 'upcoming') {
    query = query.gt('scheduled_for', today)
  }
  
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  const { data, error, count } = await query.range(from, to)
  
  if (error) throw error
  return { data, count }
}

export async function getSalesSummary() {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('total_amount')
    .eq('scheduled_for', today) // Only count sales scheduled for today
    .neq('status', 'cancelled')

  if (error) throw error

  const totalSales = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)
  const orderCount = orders.length

  return { totalSales, orderCount }
}

export async function updateOrderStatus(id: number, status: string) {
  // Update status
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Award points if completed and has user_id and points haven't been awarded yet
  if (status === 'completed' && order.user_id && !order.points_earned) {
    const pointsToAward = Math.floor(order.total_amount / 50)
    
    if (pointsToAward > 0) {
      // Update user profile
      const { error: profileError } = await supabaseAdmin.rpc('increment_points', { 
        user_id: order.user_id, 
        amount: pointsToAward 
      })

      // If RPC fails (maybe function doesn't exist), try direct update
      if (profileError) {
        // Fetch current points
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('points')
          .eq('id', order.user_id)
          .single()
        
        if (profile) {
          await supabaseAdmin
            .from('profiles')
            .update({ points: (profile.points || 0) + pointsToAward })
            .eq('id', order.user_id)
        }
      }

      // Mark points as earned in order
      await supabaseAdmin
        .from('orders')
        .update({ points_earned: pointsToAward })
        .eq('id', id)
    }
  }

  revalidatePath('/admin')
}

export async function updatePaymentStatus(id: number, status: string) {
  await supabaseAdmin.from('orders').update({ payment_status: status }).eq('id', id)
  revalidatePath('/admin')
}
