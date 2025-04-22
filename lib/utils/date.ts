import { format, formatDistanceToNow, isValid } from 'date-fns'
import { ru } from 'date-fns/locale'

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return format(dateObj, 'PPP', { locale: ru })
}

/**
 * Format date to time (HH:MM)
 */
export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return format(dateObj, 'HH:mm')
}

/**
 * Format date to datetime (DD.MM.YYYY HH:MM)
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return format(dateObj, 'dd.MM.yyyy HH:mm')
}

/**
 * Get relative time from now (e.g. "2 hours ago")
 */
export function getRelativeTime(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValid(dateObj)) return 'Invalid date'
  
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ru })
}

/**
 * Check if a date is today
 */
export function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValid(dateObj)) return false
  
  const today = new Date()
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if a date is in the past
 */
export function isPast(date: Date | string | null | undefined): boolean {
  if (!date) return false
  
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (!isValid(dateObj)) return false
  
  return dateObj < new Date()
} 