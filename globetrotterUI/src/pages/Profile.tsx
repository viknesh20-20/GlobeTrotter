import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe, Edit3, Save, Loader2, Heart, Map, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import tripsData from '../data/trips.json'

export default function Profile() {
    const { user, updateUser } = useAuth()
    const [isEditing, setIsEditing] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        phone: user?.phone || '',
        city: user?.city || '',
        country: user?.country || '',
        bio: user?.bio || '',
    })

    const userTrips = tripsData.trips.filter(t => t.userId === user?.id)
    const preplannedTrips = userTrips.filter(t => t.status === 'upcoming')
    const previousTrips = userTrips.filter(t => t.status === 'completed')

    const handleSave = async () => {
        setIsSaving(true)
        await new Promise(resolve => setTimeout(resolve, 800))
        updateUser(formData)
        setIsSaving(false)
        setIsEditing(false)
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Profile Header */}
            <div className="card overflow-hidden mb-6">
                <div className="h-32 bg-gradient-to-r from-orange-400 via-rose-400 to-orange-500" />
                <div className="relative px-6 pb-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-rose-500 rounded-full border-4 border-white dark:border-slate-800 shadow-lg flex items-center justify-center -mt-12 text-white text-2xl font-bold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </div>
                    <div className="absolute top-4 right-4">
                        <button onClick={isEditing ? handleSave : () => setIsEditing(true)} className="btn-outline py-2">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                            {isEditing ? 'Save' : 'Edit Profile'}
                        </button>
                    </div>
                    <div className="mt-4">
                        {isEditing ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={e => handleInputChange('firstName', e.target.value)}
                                        placeholder="First Name"
                                        className="input"
                                    />
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={e => handleInputChange('lastName', e.target.value)}
                                        placeholder="Last Name"
                                        className="input"
                                    />
                                </div>
                                <textarea
                                    value={formData.bio}
                                    onChange={e => handleInputChange('bio', e.target.value)}
                                    placeholder="Write a short bio..."
                                    className="input min-h-[80px]"
                                />
                            </div>
                        ) : (
                            <>
                                <h1 className="text-2xl font-bold text-dark-900 dark:text-white">{user?.firstName} {user?.lastName}</h1>
                                <p className="text-gray-500 dark:text-slate-400">{user?.bio || 'Passionate traveler exploring the world'}</p>
                            </>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                            {[
                                { icon: Mail, label: 'Email', value: user?.email, field: 'email', editable: false },
                                { icon: Phone, label: 'Phone', value: formData.phone || 'Not set', field: 'phone', editable: true },
                                { icon: MapPin, label: 'City', value: formData.city || 'Not set', field: 'city', editable: true },
                                { icon: Globe, label: 'Country', value: formData.country || 'Not set', field: 'country', editable: true },
                            ].map((item, i) => (
                                <div key={i} className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                                    <div className="flex items-center gap-2 text-gray-500 dark:text-slate-400 text-sm mb-1">
                                        <item.icon className="w-4 h-4" />{item.label}
                                    </div>
                                    {isEditing && item.editable ? (
                                        <input
                                            type="text"
                                            value={formData[item.field as keyof typeof formData] || ''}
                                            onChange={e => handleInputChange(item.field, e.target.value)}
                                            className="w-full bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded-lg px-2 py-1 text-sm text-dark-900 dark:text-white"
                                        />
                                    ) : (
                                        <p className="font-medium text-dark-900 dark:text-white truncate">{item.value}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="card p-4 text-center">
                    <p className="text-3xl font-bold text-orange-500">{userTrips.length}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Total Trips</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-500">{preplannedTrips.length}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Upcoming</p>
                </div>
                <div className="card p-4 text-center">
                    <p className="text-3xl font-bold text-blue-500">{previousTrips.length}</p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">Completed</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Preplanned Trips */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <Map className="w-5 h-5 text-orange-500" />Upcoming Trips
                    </h2>
                    <div className="space-y-3">
                        {preplannedTrips.length > 0 ? preplannedTrips.map(trip => (
                            <Link key={trip.id} to={`/trips/${trip.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                <img src={trip.coverImage} alt={trip.name} className="w-16 h-12 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-dark-900 dark:text-white truncate">{trip.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{new Date(trip.startDate).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-8">
                                <Camera className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-slate-400">No upcoming trips</p>
                                <Link to="/trips/new" className="text-orange-500 hover:underline text-sm">Plan one now →</Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Previous Trips */}
                <div className="card p-6">
                    <h2 className="text-lg font-semibold text-dark-900 dark:text-white mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-rose-500" />Completed Trips
                    </h2>
                    <div className="space-y-3">
                        {previousTrips.length > 0 ? previousTrips.map(trip => (
                            <Link key={trip.id} to={`/trips/${trip.id}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                <img src={trip.coverImage} alt={trip.name} className="w-16 h-12 rounded-lg object-cover" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-dark-900 dark:text-white truncate">{trip.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{trip.likes} likes</p>
                                </div>
                            </Link>
                        )) : (
                            <div className="text-center py-8">
                                <Heart className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-gray-500 dark:text-slate-400">No completed trips yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
