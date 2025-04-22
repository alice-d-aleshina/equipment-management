"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../types/student'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in (e.g., from localStorage)
    const checkAuthStatus = async () => {
      try {
        // Replace this with your actual authentication check
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          setUser(JSON.parse(storedUser))
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      // Replace with your actual login logic
      // Make API call to login endpoint
      // const response = await fetch('/api/auth/login', ...)
      
      // For now, mock a successful login with a dummy user
      const mockUser: User = {
        id: 1,
        active: true,
        email: email,
        phone: '',
        created: new Date(),
        card_id: '12345',
        user_type: 'teacher',
        email_verified: true,
      }
      
      // Save user data
      setUser(mockUser)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isLoading, 
        isAuthenticated, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 