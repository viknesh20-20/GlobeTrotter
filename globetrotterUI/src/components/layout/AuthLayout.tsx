import { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Globe } from 'lucide-react'

interface AuthLayoutProps {
    children?: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left Side - Brand Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-400 via-primary-500 to-secondary-500 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-80 h-80 bg-white rounded-full translate-x-1/3 translate-y-1/3" />
                    <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
                </div>

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 text-white">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <Globe className="w-10 h-10 text-white" />
                        </div>
                        <span className="text-4xl font-bold">GlobeTrotter</span>
                    </div>

                    <h1 className="text-3xl font-bold text-center mb-4">
                        Plan Your Perfect Journey
                    </h1>
                    <p className="text-lg text-white/80 text-center max-w-md">
                        Create personalized itineraries, discover amazing destinations, and share your adventures with travelers worldwide.
                    </p>

                    {/* Decorative Elements */}
                    <div className="mt-12 flex gap-6">
                        <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <span className="text-3xl">🗼</span>
                        </div>
                        <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <span className="text-3xl">🏔️</span>
                        </div>
                        <div className="w-20 h-20 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <span className="text-3xl">🏖️</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-slate-900">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-secondary-500 rounded-xl flex items-center justify-center">
                            <Globe className="w-7 h-7 text-white" />
                        </div>
                        <span className="text-2xl font-bold text-dark-900 dark:text-white">GlobeTrotter</span>
                    </div>

                    {children || <Outlet />}
                </div>
            </div>
        </div>
    )
}
