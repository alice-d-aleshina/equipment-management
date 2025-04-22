import { User } from '../types/student'

// Function to log in a user
export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to login')
    }
    
    return response.json()
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

// Function to register a new user
export async function register(userData: {
  email: string
  password: string
  name: string
  phone?: string
  user_type: string
}): Promise<User> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to register')
    }
    
    return response.json()
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// Function to log out the current user
export async function logout(): Promise<void> {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to logout')
    }
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

// Function to get the current user session
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch('/api/auth/session')
    
    if (!response.ok) {
      return null
    }
    
    return response.json()
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Function to verify card ID for equipment access
export async function verifyCardAccess(cardId: string): Promise<{ 
  hasAccess: boolean
  userId?: string
  message: string 
}> {
  try {
    const response = await fetch('/api/auth/verify-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cardId }),
    })
    
    return response.json()
  } catch (error) {
    console.error('Card verification error:', error)
    throw error
  }
} 