export interface Equipment {
  id: string
  name: string
  nameEn: string
  type: string
  status: "available" | "in_use" | "maintenance" | "broken" | "checked-out"
  location: string
  lastMaintenance: string
  nextMaintenance: string
  assignedTo?: string
  qrCode: string
  checkedOutBy: string | null
  checkedOutAt: Date | null
  group: string
  owner: string
  room: number
  building: number
  lab: number
}

export interface Student {
  id: string
  name: string
  group: string
  hasAccess: boolean
  email?: string
  phone?: string
  card_id?: string  // ID карты для верификации
}

export interface Notification {
  id: string
  message: string
  type: "success" | "error" | "info"
  timestamp: Date
  read: boolean
}

// New Interfaces based on the database schema

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

export interface Request {
  id: number // Primary Key
  status: boolean // Foreign Key
  user: number // Foreign Key
  issued_by: string // Foreign Key
  created: Date
  taken_date: Date
  planned_returned_date: Date
  return_date: Date // Timestamp
}

export interface Room {
  id: number
  name: string
  labId: number
}

export interface Lab {
  id: number
  name: string
  buildingId: number
}

export interface Building {
  id: number
  name: string
}

export interface Section {
  id: number // Primary Key
  name: string
  description: string
  room: number // Foreign Key
}

export interface Place {
  id: number // Primary Key
  name: string
  description: string
  section: number // Foreign Key
}

export interface Item {
  id: number // Primary Key
  inv_key: string
  hardware: number // Foreign Key
  room: number // Foreign Key
  status: boolean // Foreign Key
  owner: number // Foreign Key
  place: number // Foreign Key
  available: boolean
  specifications: any // JSON
  received_by: string // Foreign Key
}

export interface Hardware {
  id: number // Primary Key
  name: string
  type: string // Foreign Key
  image_link: string
  specifications: any // JSON
  item_specifications: any // JSON
  template: string
}

