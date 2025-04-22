"use client"

import { useState, useCallback } from 'react'
import { useNotifications } from '../context/NotificationContext'
import { verifyCardAccess } from '../api/auth'

interface CardReaderHookOptions {
  onSuccess?: (userId: string) => void
  onError?: (error: string) => void
}

export function useCardReader(options?: CardReaderHookOptions) {
  const [isScanning, setIsScanning] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  const startScanning = useCallback(() => {
    setIsScanning(true)
    setError(null)
    addNotification('Card reader is active', 'info')
  }, [addNotification])

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    addNotification('Card reader is inactive', 'info')
  }, [addNotification])

  const resetReader = useCallback(() => {
    setIsAuthenticated(false)
    setCurrentUserId(null)
    setError(null)
  }, [])

  const scanCard = useCallback(
    async (cardId: string) => {
      if (!isScanning) {
        setError('Card reader is not active')
        return
      }

      try {
        setError(null)
        
        // Call API to verify card access
        const result = await verifyCardAccess(cardId)
        
        if (result.hasAccess && result.userId) {
          setIsAuthenticated(true)
          setCurrentUserId(result.userId)
          addNotification('Authentication successful', 'success')
          options?.onSuccess?.(result.userId)
        } else {
          setIsAuthenticated(false)
          setError('Access denied')
          addNotification('Access denied: ' + result.message, 'error')
          options?.onError?.('Access denied: ' + result.message)
        }
      } catch (err) {
        const errorMessage = 'Card verification failed'
        setError(errorMessage)
        setIsAuthenticated(false)
        addNotification(errorMessage, 'error')
        options?.onError?.(errorMessage)
      }
    },
    [isScanning, addNotification, options]
  )

  return {
    isScanning,
    isAuthenticated,
    currentUserId,
    error,
    startScanning,
    stopScanning,
    scanCard,
    resetReader,
  }
} 