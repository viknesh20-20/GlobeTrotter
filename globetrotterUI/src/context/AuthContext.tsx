import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import type { User, AuthState, LoginCredentials, RegisterData, UserRole } from '../types'
import api from '../services/api'

interface AuthContextType extends AuthState {
    login: (credentials: LoginCredentials) => Promise<boolean>
    register: (data: RegisterData) => Promise<boolean>
    logout: () => void
    updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const STORAGE_KEY = 'globetrotter_auth'
const REFRESH_TOKEN_KEY = 'globetrotter_refresh'

// Transform backend user to frontend user format
function transformUser(backendUser: any): User {
    const nameParts = (backendUser.fullName || backendUser.full_name || '').split(' ')
    return {
        id: backendUser.id,
        email: backendUser.email,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        role: backendUser.role as UserRole,
        bio: backendUser.bio,
        city: backendUser.city,
        country: backendUser.country,
        phone: backendUser.phone,
        preferences: backendUser.preferences || {
            currency: 'USD',
            language: 'en',
            notifications: true
        },
        savedDestinations: backendUser.savedDestinations || []
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: true,
    })

    // Check for existing session on mount
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
            try {
                const { user, token } = JSON.parse(stored)
                api.setToken(token)
                setAuthState({
                    user,
                    token,
                    isAuthenticated: true,
                    isLoading: false,
                })
            } catch {
                localStorage.removeItem(STORAGE_KEY)
                localStorage.removeItem(REFRESH_TOKEN_KEY)
                setAuthState(prev => ({ ...prev, isLoading: false }))
            }
        } else {
            setAuthState(prev => ({ ...prev, isLoading: false }))
        }
    }, [])

    const login = async (credentials: LoginCredentials): Promise<boolean> => {
        try {
            const response = await api.login(credentials.email, credentials.password)
            
            if (response.error || !response.data) {
                console.error('Login failed:', response.error)
                return false
            }

            const { user: backendUser, accessToken, refreshToken } = response.data
            const user = transformUser(backendUser)
            
            api.setToken(accessToken)
            
            const authData = { user, token: accessToken }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

            setAuthState({
                user,
                token: accessToken,
                isAuthenticated: true,
                isLoading: false,
            })
            return true
        } catch (error) {
            console.error('Login error:', error)
            return false
        }
    }

    const register = useCallback(async (data: RegisterData): Promise<boolean> => {
        try {
            const response = await api.register({
                email: data.email,
                password: data.password,
                fullName: `${data.firstName} ${data.lastName}`.trim()
            })

            if (response.error || !response.data) {
                console.error('Registration failed:', response.error)
                return false
            }

            const { user: backendUser, accessToken, refreshToken } = response.data
            const user = transformUser(backendUser)

            api.setToken(accessToken)

            const authData = { user, token: accessToken }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(authData))
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)

            setAuthState({
                user,
                token: accessToken,
                isAuthenticated: true,
                isLoading: false,
            })
            return true
        } catch (error) {
            console.error('Registration error:', error)
            return false
        }
    }, [])

    const logout = useCallback(() => {
        api.setToken(null)
        localStorage.removeItem(STORAGE_KEY)
        localStorage.removeItem(REFRESH_TOKEN_KEY)
        setAuthState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
        })
    }, [])

    const updateUser = useCallback((updates: Partial<User>) => {
        setAuthState(prev => {
            if (!prev.user) return prev
            const updatedUser = { ...prev.user, ...updates }
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: updatedUser, token: prev.token }))
            return { ...prev, user: updatedUser }
        })
    }, [])

    return (
        <AuthContext.Provider value={{ ...authState, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
