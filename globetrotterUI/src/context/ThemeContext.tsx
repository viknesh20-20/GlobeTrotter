import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ThemeContextType {
    isDarkMode: boolean
    toggleDarkMode: () => void
    setDarkMode: (value: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check localStorage first
        const saved = localStorage.getItem('globetrotter-dark-mode')
        if (saved !== null) {
            return JSON.parse(saved)
        }
        // Then check system preference
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    })

    useEffect(() => {
        // Apply dark mode class to document
        if (isDarkMode) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
        // Save preference
        localStorage.setItem('globetrotter-dark-mode', JSON.stringify(isDarkMode))
    }, [isDarkMode])

    const toggleDarkMode = () => setIsDarkMode((prev: boolean) => !prev)
    const setDarkMode = (value: boolean) => setIsDarkMode(value)

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider')
    }
    return context
}
