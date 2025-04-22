"use client"

import { useState, useEffect, useCallback } from 'react'
import { Student } from '../types/student'
import { useNotifications } from '../context/NotificationContext'
import {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentAccess as apiToggleAccess
} from '../api/students'

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addNotification } = useNotifications()

  // Fetch all students
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getAllStudents()
      setStudents(data)
    } catch (err) {
      setError('Failed to fetch students')
      addNotification('Failed to fetch students', 'error')
    } finally {
      setLoading(false)
    }
  }, [addNotification])

  // Initialize students data
  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  // Add new student
  const addStudent = async (newStudent: Omit<Student, 'id'>) => {
    try {
      setLoading(true)
      const added = await createStudent(newStudent)
      setStudents((prev) => [...prev, added])
      addNotification('Student added successfully', 'success')
      return added
    } catch (err) {
      setError('Failed to add student')
      addNotification('Failed to add student', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Update student
  const editStudent = async (id: string, updatedData: Partial<Student>) => {
    try {
      setLoading(true)
      const updated = await updateStudent(id, updatedData)
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? updated : student))
      )
      addNotification('Student updated successfully', 'success')
      return updated
    } catch (err) {
      setError('Failed to update student')
      addNotification('Failed to update student', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Remove student
  const removeStudent = async (id: string) => {
    try {
      setLoading(true)
      await deleteStudent(id)
      setStudents((prev) => prev.filter((student) => student.id !== id))
      addNotification('Student removed successfully', 'success')
    } catch (err) {
      setError('Failed to remove student')
      addNotification('Failed to remove student', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Toggle student access
  const toggleStudentAccess = async (id: string, hasAccess: boolean) => {
    try {
      setLoading(true)
      const updated = await apiToggleAccess(id, hasAccess)
      setStudents((prev) =>
        prev.map((student) => (student.id === id ? updated : student))
      )
      addNotification(
        `Student access ${hasAccess ? 'granted' : 'revoked'} successfully`,
        'success'
      )
      return updated
    } catch (err) {
      setError('Failed to toggle student access')
      addNotification('Failed to toggle student access', 'error')
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    editStudent,
    removeStudent,
    toggleStudentAccess,
  }
} 