"use client"

import { useState, useEffect, useCallback } from 'react'
import { Equipment } from '../types/equipment'
import { useNotifications } from '../context/NotificationContext'
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  checkoutEquipment as apiCheckoutEquipment,
  returnEquipment as apiReturnEquipment
} from '../api/equipment'

export function useEquipment() {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  // Fetch all equipment
  const fetchEquipment = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllEquipment()
      setEquipment(data)
    } catch (err) {
      setError('Failed to fetch equipment')
      addNotification('Failed to fetch equipment', 'error')
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  // Initialize equipment data
  useEffect(() => {
    fetchEquipment()
  }, [fetchEquipment])

  // Add new equipment
  const addEquipment = async (newEquipment: Omit<Equipment, 'id'>) => {
    try {
      setLoading(true)
      const added = await createEquipment(newEquipment)
      setEquipment((prev) => [...prev, added])
      addNotification('Equipment added successfully', 'success')
      return added
    } catch (err) {
      setError('Failed to add equipment')
      addNotification('Failed to add equipment', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update equipment
  const editEquipment = async (id: string, updatedData: Partial<Equipment>) => {
    try {
      setLoading(true)
      const updated = await updateEquipment(id, updatedData)
      setEquipment((prev) =>
        prev.map((item) => (item.id === id ? updated : item))
      )
      addNotification('Equipment updated successfully', 'success')
      return updated
    } catch (err) {
      setError('Failed to update equipment')
      addNotification('Failed to update equipment', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Remove equipment
  const removeEquipment = async (id: string) => {
    try {
      setLoading(true)
      await deleteEquipment(id)
      setEquipment((prev) => prev.filter((item) => item.id !== id))
      addNotification('Equipment removed successfully', 'success')
    } catch (err) {
      setError('Failed to remove equipment')
      addNotification('Failed to remove equipment', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Checkout equipment
  const checkoutEquipment = async (equipmentId: string, studentId: string) => {
    try {
      setLoading(true)
      const updated = await apiCheckoutEquipment(equipmentId, studentId)
      setEquipment((prev) =>
        prev.map((item) => (item.id === equipmentId ? updated : item))
      )
      addNotification('Equipment checked out successfully', 'success')
      return updated
    } catch (err) {
      setError('Failed to checkout equipment')
      addNotification('Failed to checkout equipment', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Return equipment
  const returnEquipment = async (equipmentId: string) => {
    try {
      setLoading(true)
      const updated = await apiReturnEquipment(equipmentId)
      setEquipment((prev) =>
        prev.map((item) => (item.id === equipmentId ? updated : item))
      )
      addNotification('Equipment returned successfully', 'success')
      return updated
    } catch (err) {
      setError('Failed to return equipment')
      addNotification('Failed to return equipment', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    equipment,
    loading,
    error,
    fetchEquipment,
    addEquipment,
    editEquipment,
    removeEquipment,
    checkoutEquipment,
    returnEquipment,
  }
} 