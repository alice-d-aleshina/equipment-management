// This file defines the database schema and relationships
// It can be used with an ORM like Prisma or for TypeScript type checking

import { Building, Lab, Room, Section, Place } from '../types/location'
import { Equipment, Item, Hardware } from '../types/equipment'
import { User, Student } from '../types/student'
import { Request, Notification } from '../types/common'

// User Types
export type UserRole = 'admin' | 'teacher' | 'student'

export interface UserSchema {
  id: number
  active: boolean
  email: string
  phone: string
  name: string
  created: Date
  card_id: string
  user_type: UserRole
  email_verified: boolean
  password_hash: string
}

// Request Schema
export interface RequestSchema {
  id: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  user_id: number
  issued_by_id: number
  created: Date
  taken_date: Date
  planned_returned_date: Date
  return_date: Date | null
  items: number[] // Array of item IDs
}

// Location Schemas
export interface BuildingSchema {
  id: number
  address: string
  name: string
  created: Date
  rooms: number[] // Array of room IDs
}

export interface LabSchema {
  id: number
  name: string
  created: Date
  rooms: number[] // Array of room IDs
}

export interface RoomSchema {
  id: number
  name: string
  lab_id: number
  created: Date
  building_id: number
  type: string
  sections: number[] // Array of section IDs
  items: number[] // Array of item IDs
}

export interface SectionSchema {
  id: number
  name: string
  description: string
  room_id: number
  places: number[] // Array of place IDs
}

export interface PlaceSchema {
  id: number
  name: string
  description: string
  section_id: number
  items: number[] // Array of item IDs
}

// Equipment Schemas
export interface HardwareSchema {
  id: number
  name: string
  type: string
  image_link: string
  specifications: Record<string, any>
  item_specifications: Record<string, any>
  template: string
  items: number[] // Array of item IDs
}

export interface ItemSchema {
  id: number
  inv_key: string
  hardware_id: number
  room_id: number
  status: 'available' | 'checked-out' | 'maintenance' | 'lost'
  owner_id: number
  place_id: number
  available: boolean
  specifications: Record<string, any>
  received_by_id: number | null
  current_request_id: number | null
}

// Schema Relationships
export interface Relationships {
  // User relationships
  user_requests: Record<number, number[]> // User ID to Request IDs
  
  // Building to rooms
  building_rooms: Record<number, number[]> // Building ID to Room IDs
  
  // Lab to rooms
  lab_rooms: Record<number, number[]> // Lab ID to Room IDs
  
  // Room relationships
  room_sections: Record<number, number[]> // Room ID to Section IDs
  room_items: Record<number, number[]> // Room ID to Item IDs
  
  // Section to places
  section_places: Record<number, number[]> // Section ID to Place IDs
  
  // Place to items
  place_items: Record<number, number[]> // Place ID to Item IDs
  
  // Hardware to items
  hardware_items: Record<number, number[]> // Hardware ID to Item IDs
  
  // Item relationships
  item_requests: Record<number, number[]> // Item ID to Request IDs
} 