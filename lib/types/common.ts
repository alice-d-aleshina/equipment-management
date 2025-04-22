export interface Notification {
  id: string
  message: string
  type: "success" | "error" | "info"
  timestamp: Date
  read: boolean
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