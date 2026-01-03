import { useState, ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

interface MainLayoutProps {
    children?: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-brandDark-900 transition-colors duration-300">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
                <Sidebar
                    isCollapsed={isSidebarCollapsed}
                    onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                />
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileSidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                    <div className="fixed left-0 top-0 h-full z-50 lg:hidden">
                        <Sidebar isCollapsed={false} onToggle={() => setIsMobileSidebarOpen(false)} isMobileOpen={true} />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div
                className={`transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
                    }`}
            >
                <Header
                    onMenuToggle={() => setIsMobileSidebarOpen(true)}
                    isSidebarCollapsed={isSidebarCollapsed}
                />
                <main className="p-6 animate-fade-in">
                    {children || <Outlet />}
                </main>
            </div>
        </div>
    )
}
