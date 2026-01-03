import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Mail, Phone, MapPin, Globe, Lock, Eye, EyeOff, Loader2, FileText } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
    const navigate = useNavigate()
    const { register } = useAuth()

    // Form fields matching Screen 2 wireframe:
    // First Name, Last Name, Email Address, Phone Number, City, Country, Additional Information
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        city: '',
        country: '',
        additionalInfo: '',
        password: '',
        confirmPassword: '',
    })

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
        if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
        if (!formData.email.trim()) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format'
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        if (!formData.city.trim()) newErrors.city = 'City is required'
        if (!formData.country.trim()) newErrors.country = 'Country is required'
        if (!formData.password) newErrors.password = 'Password is required'
        else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        const success = await register({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            phone: formData.phone,
            city: formData.city,
            country: formData.country,
        })
        setIsLoading(false)

        if (success) {
            navigate('/')
        } else {
            setErrors({ email: 'This email is already registered' })
        }
    }

    return (
        <div className="animate-fade-in">
            {/* Photo/Avatar Icon - Following Screen 2 wireframe */}
            <div className="flex justify-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                    <User className="w-10 h-10 text-primary-500" />
                </div>
            </div>

            {/* Form Header */}
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-dark-900">Create Account</h2>
                <p className="text-gray-500 mt-1">Join GlobeTrotter and start your journey</p>
            </div>

            {/* Registration Form - Following Screen 2 layout */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: First Name & Last Name */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-dark-700 mb-1.5">
                            First Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="firstName"
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                placeholder="First Name"
                                className={`input pl-9 ${errors.firstName ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-dark-700 mb-1.5">
                            Last Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="lastName"
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                placeholder="Last Name"
                                className={`input pl-9 ${errors.lastName ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                </div>

                {/* Row 2: Email Address & Phone Number */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-dark-700 mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-dark-700 mb-1.5">
                            Phone Number
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="Phone Number"
                                className={`input pl-9 ${errors.phone ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                </div>

                {/* Row 3: City & Country */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-dark-700 mb-1.5">
                            City
                        </label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="city"
                                name="city"
                                type="text"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="City"
                                className={`input pl-9 ${errors.city ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-dark-700 mb-1.5">
                            Country
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="country"
                                name="country"
                                type="text"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="Country"
                                className={`input pl-9 ${errors.country ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                    </div>
                </div>

                {/* Additional Information */}
                <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-dark-700 mb-1.5">
                        Additional Information (Optional)
                    </label>
                    <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <textarea
                            id="additionalInfo"
                            name="additionalInfo"
                            value={formData.additionalInfo}
                            onChange={handleChange}
                            placeholder="Tell us about your travel interests..."
                            rows={2}
                            className="input pl-9 resize-none"
                        />
                    </div>
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-dark-700 mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className={`input pl-9 pr-9 ${errors.password ? 'input-error' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark-700 mb-1.5">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm"
                                className={`input pl-9 ${errors.confirmPassword ? 'input-error' : ''}`}
                            />
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                </div>

                {/* Register Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-primary w-full py-3 mt-2"
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating Account...
                        </>
                    ) : (
                        'Register Now'
                    )}
                </button>
            </form>

            {/* Login Link */}
            <p className="mt-6 text-center text-dark-600">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-500 hover:text-primary-600 font-medium">
                    Sign In
                </Link>
            </p>
        </div>
    )
}
