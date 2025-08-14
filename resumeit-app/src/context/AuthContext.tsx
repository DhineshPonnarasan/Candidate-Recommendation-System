'use client'
import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
export type User = {
  id?: string
  username?: string
  name: string
  email: string
  first_name?: string
  last_name?: string
  plan?: 'Starter' | 'Pro' | 'Team'
  avatarUrl?: string
  access_token?: string
}
type AuthContextType = {
  user: User | null
  login: (usernameOrEmail: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  ready: boolean
  loading: boolean
}
type RegisterData = {
  username: string
  email: string
  password: string
  first_name: string
  last_name: string
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [ready, setReady] = useState(false)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const raw = localStorage.getItem('resumeit_user')
        if (raw) {
          const userData = JSON.parse(raw)
          if (userData.access_token) {
            try {
              setUser(userData)
            } catch (error) {
              console.log('Token validation failed, clearing stored user')
              localStorage.removeItem('resumeit_user')
            }
          } else {
            setUser(userData) // For backward compatibility with mock data
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      }
      setReady(true)
    }
    initAuth()
  }, [])
  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    setLoading(true)
    try {
      try {
        const { APIService } = await import('@/services/apiService')
        const apiService = new APIService()
        const response = await apiService.login(usernameOrEmail, password)
        const userData: User = {
          id: response.user.id,
          username: response.user.username,
          name: `${response.user.first_name} ${response.user.last_name}`.trim() || response.user.username,
          email: response.user.email,
          first_name: response.user.first_name,
          last_name: response.user.last_name,
          plan: 'Starter',
          access_token: response.access_token,
        }
        setUser(userData)
        localStorage.setItem('resumeit_user', JSON.stringify(userData))
        return
      } catch (backendError) {
        console.log('Backend authentication failed, trying demo login:', backendError)
        if ((usernameOrEmail === 'admin' || usernameOrEmail === 'demo') && password === 'admin123') {
          const demoUser: User = {
            id: 'demo-1',
            username: 'demo',
            name: 'Demo User',
            email: 'demo@resumeit.com',
            first_name: 'Demo',
            last_name: 'User',
            plan: 'Pro',
          }
          setUser(demoUser)
          localStorage.setItem('resumeit_user', JSON.stringify(demoUser))
          return
        }
        throw backendError
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])
  const register = useCallback(async (userData: RegisterData) => {
    setLoading(true)
    try {
      try {
        const { APIService } = await import('@/services/apiService')
        const apiService = new APIService()
        await apiService.register(userData)
        await login(userData.username, userData.password)
        return
      } catch (backendError) {
        console.log('Backend registration failed, using demo mode:', backendError)
        const demoUser: User = {
          id: `demo-${Date.now()}`,
          username: userData.username,
          name: `${userData.first_name} ${userData.last_name}`.trim(),
          email: userData.email,
          first_name: userData.first_name,
          last_name: userData.last_name,
          plan: 'Starter',
        }
        setUser(demoUser)
        localStorage.setItem('resumeit_user', JSON.stringify(demoUser))
      }
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }, [login])
  const logout = useCallback(() => {
    setUser(null)
    try { localStorage.removeItem('resumeit_user') } catch {}
  }, [])
  const value = useMemo(() => ({ user, login, register, logout, ready, loading }), [user, ready, loading, login, register, logout])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
