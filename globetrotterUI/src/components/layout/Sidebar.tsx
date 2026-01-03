import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Map,
    PlusCircle,
    Compass,
    Globe,
    Calendar,
    Users,
    LogOut,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Plane,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface SidebarProps {
    isCollapsed: boolean
    onToggle: () => void
    isMobileOpen?: boolean
}

export default function Sidebar({ isCollapsed, onToggle, isMobileOpen: isMobileOpenProp }: SidebarProps) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [isMobileOpenInternal, setIsMobileOpenInternal] = useState(false)

    // Use prop if provided, otherwise use internal state
    const isMobileOpen = isMobileOpenProp !== undefined ? isMobileOpenProp : isMobileOpenInternal
    const setIsMobileOpen = setIsMobileOpenInternal

    const isOpen = !isCollapsed

    const navItems = [
        { label: 'Dashboard', path: '/', icon: LayoutDashboard, exact: true },
        { label: 'My Trips', path: '/trips', icon: Map, exact: true },
        { label: 'Plan New Trip', path: '/trips/new', icon: PlusCircle, exact: true },
        { label: 'Explore Cities', path: '/cities', icon: Compass, exact: false },
        { label: 'Activities', path: '/activities', icon: Globe, exact: false },
        { label: 'Calendar', path: '/calendar', icon: Calendar, exact: true },
        { label: 'Community', path: '/community', icon: Users, exact: false },
    ]

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    // Fixed routing logic - exact match for specific routes
    const isActiveRoute = (path: string, exact: boolean) => {
        if (exact) {
            return location.pathname === path
        }
        return location.pathname.startsWith(path)
    }

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
                        onClick={() => setIsMobileOpen(false)}
                    />
                )}
            </AnimatePresence>

            <aside
                className={`
                    fixed left-0 top-0 h-screen z-40 transition-all duration-300 ease-out
                    bg-slate-800 border-r border-slate-700/50
                    ${isOpen ? 'w-64' : 'w-20'}
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700/50">
                    <Link
                        to="/"
                        className={`flex items-center gap-3 overflow-hidden ${!isOpen && 'justify-center w-full'}`}
                    >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 flex-shrink-0">
                            <Plane size={20} className="rotate-45" />
                        </div>
                        {isOpen && (
                            <span className="font-bold text-lg text-white">
                                GlobeTrotter
                            </span>
                        )}
                    </Link>
                    {isOpen && (
                        <button
                            onClick={onToggle}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            aria-label="Collapse sidebar"
                        >
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {/* Expand button when collapsed */}
                {!isOpen && (
                    <div className="flex justify-center py-3 border-b border-slate-700/50">
                        <button
                            onClick={onToggle}
                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
                            aria-label="Expand sidebar"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* User Profile Section */}
                {isOpen && user && (
                    <div className="p-4 border-b border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-semibold text-sm">
                                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <nav className="p-3 space-y-1 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    <p className={`text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 ${!isOpen && 'text-center'}`}>
                        {isOpen ? 'Navigation' : '•••'}
                    </p>

                    {navItems.map((item) => {
                        const isActive = isActiveRoute(item.path, item.exact)

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`
                                    relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group
                                    ${isActive
                                        ? 'bg-orange-500/10 text-orange-400'
                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                                    }
                                    ${!isOpen && 'justify-center px-2'}
                                `}
                                title={!isOpen ? item.label : ''}
                                onClick={() => window.innerWidth < 768 && setIsMobileOpen(false)}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 my-auto h-5 bg-orange-500 rounded-r-full"
                                        style={{ marginTop: 'auto', marginBottom: 'auto' }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}
                                <item.icon
                                    size={20}
                                    className={`flex-shrink-0 transition-colors ${isActive ? 'text-orange-400' : 'group-hover:text-orange-400'}`}
                                />
                                {isOpen && (
                                    <span className="text-sm font-medium truncate">{item.label}</span>
                                )}
                            </Link>
                        )
                    })}

                    {/* Separator */}
                    <div className="my-4 border-t border-slate-700/50" />

                    {/* Admin Link - RBAC restricted */}
                    {user?.role === 'admin' && (
                        <Link
                            to="/admin"
                            className={`
                                relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200 group
                                ${location.pathname.startsWith('/admin')
                                    ? 'bg-amber-500/10 text-amber-400'
                                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-amber-400'
                                }
                                ${!isOpen && 'justify-center px-2'}
                            `}
                            title={!isOpen ? 'Admin Panel' : ''}
                        >
                            {location.pathname.startsWith('/admin') && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-500 rounded-r-full" />
                            )}
                            <ShieldCheck size={20} className={`flex-shrink-0 ${location.pathname.startsWith('/admin') ? 'text-amber-400' : ''}`} />
                            {isOpen && <span className="text-sm font-medium">Admin Panel</span>}
                        </Link>
                    )}
                </nav>

                {/* Logout Button - Fixed at bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-slate-700/50 bg-slate-800">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200
                            text-slate-400 hover:bg-red-500/10 hover:text-red-400
                            ${!isOpen && 'justify-center'}
                        `}
                        title={!isOpen ? 'Logout' : ''}
                    >
                        <LogOut size={20} className="flex-shrink-0" />
                        {isOpen && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    )
}
