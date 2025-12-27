export interface MenuItem {
  id: number
  name: string
  description: string | null
  price: number
  image_url: string | null
  category: string
  is_available: boolean
}

export interface CartItem extends MenuItem {
  quantity: number
}

export interface Order {
  id: number
  created_at: string
  user_email: string
  status: string
  total_amount: number
  payment_method: string
  payment_status: string
  items?: OrderItem[]
}

export interface OrderItem {
  id: number
  menu_item_id: number
  quantity: number
  price_at_time: number
  menu_item?: MenuItem
}
