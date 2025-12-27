'use server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

export async function getOrder(uuid: string) {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*, items:order_items(quantity, price_at_time, menu_item:menu_items(name, image_url))')
    .eq('order_uuid', uuid)
    .single()
  
  if (error) return null
  return data
}
