export interface Room {
  id: number // Primary Key
  name: string
  lab: number // Foreign Key
  created: Date
  building: number // Foreign Key
  type: string
}

export interface Lab {
  id: number // Primary Key
  name: string
  created: Date
}

export interface Building {
  id: number // Primary Key
  address: string
  name: string
  created: Date
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