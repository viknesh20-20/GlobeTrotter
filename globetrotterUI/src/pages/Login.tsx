import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, Loader2, User as UserIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import usersData from '../data/users.json'

export default function Login() {
    const navigate = useNavigate()
    const { login } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')

        if (!email || !password) {
            setError('Please fill in all fields')
            return
        }

        setIsLoading(true)
        const success = await login({ email, password })
        setIsLoading(false)

        if (success) {
            navigate('/')
        } else {
            setError('Invalid email or password')
        }
    }

    const fillDemoCredentials = () => {
        setEmail(usersData.demoCredentials.email)
        setPassword(usersData.demoCredentials.password)
        setError('')
    }

    return (
        <div className="animate-fade-in">
            {/* Photo/Avatar Icon - Following Screen 1 wireframe */}
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <UserIcon className="w-12 h-12 text-primary-500" />
                </div>
            </div>

            {/* Form Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-dark-900">Welcome Back</h2>
                <p className="text-gray-500 mt-1">Sign in to continue your journey</p>
            </div>

            {/* Demo Credentials Box */}
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 border border-secondary-200 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-dark-700 mb-2">🔑 Demo Credentials</p>
                <div className="flex flex-col sm:flex-row gap-2 text-sm">
                    <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <span className="text-gray-500">Email:</span>{' '}
                        <span className="font-medium text-dark-900">{usersData.demoCredentials.email}</span>
                    </div>
                    <div className="flex-1 bg-white rounded-lg px-3 py-2 border border-gray-200">
                        <span className="text-gray-500">Pass:</span>{' '}
                        <span className="font-medium text-dark-900">{usersData.demoCredentials.password}</span>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={fillDemoCredentials}
                    className="w-full mt-3 text-sm text-secondary-600 hover:text-secondary-700 font-medium transition-colors"
                >
                    Click to auto-fill demo credentials →
                </button>
            </div>

            {/* Login Form - Following Screen 1: Username & Password fields */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email/Username Field */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-dark-700 mb-1.5">
                        Email Address
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            className={`input pl-10 ${error ? 'input-error' : ''}`}
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-1.5">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className={`input pl-10 pr-10 ${error ? 'input-error' : ''}`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-200 animate-fade-in">
                        {error}
                    </div>
                )}

                {/* Forgot Password Link */}
                <div className="flex justify-end">
                    <button type="button" className="text-sm text-primary-500 hover:text-primary-600 font-medium">
                        Forgot Password?
                    </button>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Signing In...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-dark-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary-500 hover:text-primary-600 font-medium">
                    Register Here
                </Link>
            </p>
        </div>
    )
}
