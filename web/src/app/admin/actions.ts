'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { revalidatePath } from 'next/cache'

export async function getOrders() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, items:order_items(quantity, menu_item:menu_items(name))')
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function updateOrderStatus(id: number, status: string) {
  await supabaseAdmin.from('orders').update({ status }).eq('id', id)
  revalidatePath('/admin')
}

export async function updatePaymentStatus(id: number, status: string) {
  await supabaseAdmin.from('orders').update({ payment_status: status }).eq('id', id)
  revalidatePath('/admin')
}
