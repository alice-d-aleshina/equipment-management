import { Student } from '../types/student'

// Function to fetch all students
export async function getAllStudents(): Promise<Student[]> {
  try {
    const response = await fetch('/api/students')
    if (!response.ok) {
      throw new Error('Failed to fetch students')
    }
    return response.json()
  } catch (error) {
    console.error('Error fetching students:', error)
    throw error
  }
}

// Function to get a single student by ID
export async function getStudentById(id: string): Promise<Student> {
  try {
    const response = await fetch(`/api/students/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch student')
    }
    return response.json()
  } catch (error) {
    console.error(`Error fetching student with ID ${id}:`, error)
    throw error
  }
}

// Function to create a new student
export async function createStudent(student: Omit<Student, 'id'>): Promise<Student> {
  try {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    })
    if (!response.ok) {
      throw new Error('Failed to create student')
    }
    return response.json()
  } catch (error) {
    console.error('Error creating student:', error)
    throw error
  }
}

// Function to update a student
export async function updateStudent(id: string, student: Partial<Student>): Promise<Student> {
  try {
    const response = await fetch(`/api/students/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(student),
    })
    if (!response.ok) {
      throw new Error('Failed to update student')
    }
    return response.json()
  } catch (error) {
    console.error(`Error updating student with ID ${id}:`, error)
    throw error
  }
}

// Function to delete a student
export async function deleteStudent(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error('Failed to delete student')
    }
  } catch (error) {
    console.error(`Error deleting student with ID ${id}:`, error)
    throw error
  }
}

// Function to toggle student access
export async function toggleStudentAccess(id: string, hasAccess: boolean): Promise<Student> {
  try {
    const response = await fetch(`/api/students/${id}/access`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ hasAccess }),
    })
    if (!response.ok) {
      throw new Error('Failed to toggle student access')
    }
    return response.json()
  } catch (error) {
    console.error(`Error toggling access for student with ID ${id}:`, error)
    throw error
  }
} 