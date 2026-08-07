export type Role = 'admin' | 'customer'
export type OrderStatus = 'pending' | 'approved' | 'rejected'

export interface Profile {
  id: string
  name: string
  role: Role
  active: boolean
  created_at: string
}

export interface Product {
  id: string
  ean: string | null
  name: string
  description: string
  category: string
  price_cents: number
  stock: number
  image_path: string | null
  active: boolean
  created_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_name: string
  unit_price_cents: number
  quantity: number
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total_cents: number
  receipt_path: string
  review_note: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
  order_items?: OrderItem[]
  profiles?: Pick<Profile, 'name'>
}

export interface Settings {
  id: number
  pix_key: string
  pix_key_type: 'cpf' | 'cnpj' | 'email' | 'telefone' | 'aleatoria'
  merchant_name: string
  merchant_city: string
}
