import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Search, Menu, X, Moon, Sun, Settings } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'

interface HeaderProps {
    onMenuToggle?: () => void
    isSidebarCollapsed?: boolean
}

export default function Header({ onMenuToggle }: HeaderProps) {
    const location = useLocation()
    const { user } = useAuth()
    const { isDarkMode, toggleDarkMode } = useTheme()
    const [showSearch, setShowSearch] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    // Get page title based on route
    const getPageTitle = () => {
        const path = location.pathname
        if (path === '/') return 'Dashboard'
        if (path === '/trips') return 'My Trips'
        if (path === '/trips/new') return 'Plan New Trip'
        if (path.startsWith('/trips/') && path.includes('/edit')) return 'Edit Itinerary'
        if (path.startsWith('/trips/')) return 'Trip Details'
        if (path === '/cities') return 'Explore Cities'
        if (path === '/activities') return 'Activities'
        if (path === '/calendar') return 'Calendar'
        if (path === '/community') return 'Community'
        if (path === '/profile') return 'Profile'
        if (path.startsWith('/admin')) return 'Admin Dashboard'
        return 'GlobeTrotter'
    }

    const notifications = [
        { id: 1, message: 'Your trip to Paris starts in 3 days!', time: '2h ago', unread: true },
        { id: 2, message: 'New activity added near Barcelona', time: '5h ago', unread: true },
        { id: 3, message: 'Your trip was liked by 5 travelers', time: '1d ago', unread: false },
    ]

    const unreadCount = notifications.filter(n => n.unread).length

    return (
        <header className="h-16 bg-white dark:bg-brandDark-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 sticky top-0 z-30 transition-colors duration-300">
            {/* Left Side */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Menu className="w-5 h-5 text-brandDark-600 dark:text-slate-300" />
                </button>
                <div>
                    <h1 className="text-xl font-semibold text-brandDark-900 dark:text-white">{getPageTitle()}</h1>
                    <p className="text-sm text-gray-500 dark:text-slate-400 hidden sm:block">
                        Welcome back, {user?.firstName}!
                    </p>
                </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
                {/* Dark Mode Toggle */}
                <motion.button
                    onClick={toggleDarkMode}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    whileTap={{ scale: 0.95 }}
                >
                    <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                            key={isDarkMode ? 'dark' : 'light'}
                            initial={{ y: -20, opacity: 0, rotate: -90 }}
                            animate={{ y: 0, opacity: 1, rotate: 0 }}
                            exit={{ y: 20, opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            {isDarkMode ? (
                                <Sun className="w-5 h-5 text-amber-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-slate-600" />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </motion.button>

                {/* Search */}
                <div className="relative">
                    <button
                        onClick={() => setShowSearch(!showSearch)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {showSearch ? (
                            <X className="w-5 h-5 text-brandDark-600 dark:text-slate-300" />
                        ) : (
                            <Search className="w-5 h-5 text-brandDark-600 dark:text-slate-300" />
                        )}
                    </button>

                    <AnimatePresence>
                        {showSearch && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 p-3"
                            >
                                <input
                                    type="text"
                                    placeholder="Search cities, activities..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-brandDark-900 text-brandDark-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    autoFocus
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
                    >
                        <Bell className="w-5 h-5 text-brandDark-600 dark:text-slate-300" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                            >
                                <div className="p-3 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-brandDark-900">
                                    <h3 className="font-semibold text-brandDark-900 dark:text-white">Notifications</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {notifications.map(notif => (
                                        <div
                                            key={notif.id}
                                            className={`p-3 border-b border-gray-50 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors ${notif.unread ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                                                }`}
                                        >
                                            <p className="text-sm text-brandDark-800 dark:text-slate-200">{notif.message}</p>
                                            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">{notif.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-2 bg-gray-50 dark:bg-brandDark-900">
                                    <button className="w-full text-center text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 font-medium py-1">
                                        View all notifications
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-rose-500 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-medium text-sm">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </span>
                        </div>
                    </button>

                    <AnimatePresence>
                        {showUserMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                            >
                                <div className="p-4 border-b border-gray-100 dark:border-slate-700">
                                    <p className="font-semibold text-brandDark-900 dark:text-white">{user?.firstName} {user?.lastName}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link
                                        to="/profile"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-brandDark-800 dark:text-slate-200"
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span className="text-sm">Profile Settings</span>
                                    </Link>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    )
}
