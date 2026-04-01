import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token, setToken] = useState(() => localStorage.getItem('token') || null)

  const saveSession = useCallback((userData, tokenStr) => {
    localStorage.setItem('user',  JSON.stringify(userData))
    localStorage.setItem('token', tokenStr)
    setUser(userData)
    setToken(tokenStr)
  }, [])

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/register', payload)
    saveSession(data.data.user, data.data.token)
    return data
  }, [saveSession])

  const login = useCallback(async (payload) => {
    const { data } = await api.post('/login', payload)
    saveSession(data.data.user, data.data.token)
    return data
  }, [saveSession])

  const logout = useCallback(async () => {
    try { await api.post('/logout') } catch (_) {}
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    setUser(null)
    setToken(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, register, login, logout, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
