'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { revalidatePath } from 'next/cache'

export async function getMenuItems() {
  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .select('*')
    .order('id', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createMenuItem(formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const image_url = formData.get('image_url') as string

  const { error } = await supabaseAdmin
    .from('menu_items')
    .insert({ name, description, price, category, image_url })

  if (error) throw error
  revalidatePath('/admin/menu')
  revalidatePath('/')
}

export async function updateMenuItem(id: number, formData: FormData) {
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const category = formData.get('category') as string
  const image_url = formData.get('image_url') as string
  const is_available = formData.get('is_available') === 'on'

  const { error } = await supabaseAdmin
    .from('menu_items')
    .update({ name, description, price, category, image_url, is_available })
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/menu')
  revalidatePath('/')
}

export async function deleteMenuItem(id: number) {
  const { error } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('id', id)

  if (error) throw error
  revalidatePath('/admin/menu')
  revalidatePath('/')
}
