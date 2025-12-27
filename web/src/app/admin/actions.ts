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

export async function getSalesSummary() {
  // Get today's start timestamp
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const { data: orders, error } = await supabaseAdmin
    .from('orders')
    .select('total_amount')
    .gte('created_at', today.toISOString())
    .neq('status', 'cancelled') // Exclude cancelled orders

  if (error) throw error

  const totalSales = orders.reduce((sum, order) => sum + Number(order.total_amount), 0)
  const orderCount = orders.length

  return { totalSales, orderCount }
}

export async function updateOrderStatus(id: number, status: string) {
  await supabaseAdmin.from('orders').update({ status }).eq('id', id)
  revalidatePath('/admin')
}

export async function updatePaymentStatus(id: number, status: string) {
  await supabaseAdmin.from('orders').update({ payment_status: status }).eq('id', id)
  revalidatePath('/admin')
}
