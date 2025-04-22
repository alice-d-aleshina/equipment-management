export interface Student {
  id: string
  name: string
  group: string
  hasAccess: boolean
}

export interface User {
  id: number // Primary Key
  active: boolean
  email: string
  phone: string
  created: Date
  card_id: string
  user_type: string // Foreign Key
  email_verified: boolean
} 