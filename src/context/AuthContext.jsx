import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()
export const useAuth = () => useContext(AuthContext)

axios.defaults.baseURL = import.meta.env.VITE_API_URL || '/api'

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null)
  const [token, setToken]   = useState(() => localStorage.getItem('fb_token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      axios.get('/auth/me')
        .then(r => setUser(r.data.user))
        .catch(() => { setToken(null); localStorage.removeItem('fb_token') })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password })
    localStorage.setItem('fb_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await axios.post('/auth/register', { name, email, password })
    localStorage.setItem('fb_token', data.token)
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setToken(data.token)
    setUser(data.user)
    return data
  }

  const logout = () => {
    setUser(null); setToken(null)
    localStorage.removeItem('fb_token')
    delete axios.defaults.headers.common['Authorization']
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
