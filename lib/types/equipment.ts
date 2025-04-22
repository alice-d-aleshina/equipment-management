export interface Equipment {
  id: string
  name: string
  status: "available" | "checked-out"
  checkedOutBy?: string | null
  checkedOutAt?: Date | null
  group: string
  owner: string
  location: string
  room: number
  building: number
  lab: number
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