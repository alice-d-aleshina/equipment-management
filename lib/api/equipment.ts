import { Equipment } from '../types/equipment'

// Function to fetch all equipment
export async function getAllEquipment(): Promise<Equipment[]> {
  try {
    const response = await fetch('/api/equipment')
    if (!response.ok) {
      throw new Error('Failed to fetch equipment')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching equipment:', error)
    throw error
  }
}

// Function to get a single equipment item by ID
export async function getEquipmentById(id: string): Promise<Equipment> {
  try {
    const response = await fetch(`/api/equipment/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch equipment')
    }
    return response.json()
  } catch (error) {
    console.error(`Error fetching equipment with ID ${id}:`, error)
    throw error
  }
}

// Function to create a new equipment item
export async function createEquipment(equipment: Omit<Equipment, 'id'>): Promise<Equipment> {
  try {
    const response = await fetch('/api/equipment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipment),
    })
    if (!response.ok) {
      throw new Error('Failed to create equipment')
    }
    return response.json()
  } catch (error) {
    console.error('Error creating equipment:', error)
    throw error
  }
}

// Function to update an equipment item
export async function updateEquipment(id: string, equipment: Partial<Equipment>): Promise<Equipment> {
  try {
    const response = await fetch(`/api/equipment/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(equipment),
    })
    if (!response.ok) {
      throw new Error('Failed to update equipment')
    }
    return response.json()
  } catch (error) {
    console.error(`Error updating equipment with ID ${id}:`, error)
    throw error
  }
}

// Function to delete an equipment item
export async function deleteEquipment(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/equipment/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete equipment')
    }
  } catch (error) {
    console.error(`Error deleting equipment with ID ${id}:`, error)
    throw error
  }
}

// Function to checkout equipment to a student
export async function checkoutEquipment(equipmentId: string, studentId: string): Promise<Equipment> {
  try {
    const response = await fetch(`/api/equipment/${equipmentId}/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId }),
    })
    if (!response.ok) {
      throw new Error('Failed to checkout equipment')
    }
    return response.json()
  } catch (error) {
    console.error(`Error checking out equipment with ID ${equipmentId}:`, error)
    throw error
  }
}

// Function to return equipment
export async function returnEquipment(equipmentId: string): Promise<Equipment> {
  try {
    const response = await fetch(`/api/equipment/${equipmentId}/return`, {
      method: 'POST',
    })
    if (!response.ok) {
      throw new Error('Failed to return equipment')
    }
    return response.json()
  } catch (error) {
    console.error(`Error returning equipment with ID ${equipmentId}:`, error)
    throw error
  }
} 