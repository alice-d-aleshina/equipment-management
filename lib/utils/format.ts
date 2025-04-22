/**
 * Format a number with thousand separators
 */
export function formatNumber(
  number: number,
  options: { decimals?: number; decimalSeparator?: string; thousandSeparator?: string } = {}
): string {
  const {
    decimals = 0,
    decimalSeparator = ',',
    thousandSeparator = ' '
  } = options

  return number
    .toFixed(decimals)
    .replace('.', decimalSeparator)
    .replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  options: { currency?: string; decimals?: number } = {}
): string {
  const { currency = '₽', decimals = 2 } = options
  
  return `${formatNumber(amount, { decimals })} ${currency}`
}

/**
 * Truncate text to a specific length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format a file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
} 