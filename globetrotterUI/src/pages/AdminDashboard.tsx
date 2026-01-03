import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, BarChart3, MapPin, Globe, Users,
    Plus, Edit2, Trash2, Search, X, Check, Eye, Plane
} from 'lucide-react'
import analyticsData from '../data/analytics.json'
import citiesData from '../data/cities.json'
import activitiesData from '../data/activities.json'
import usersData from '../data/users.json'
import tripsData from '../data/trips.json'

type AdminTab = 'overview' | 'trips' | 'cities' | 'activities' | 'users'

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview')

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'trips', label: 'Trips', icon: Plane },
        { id: 'cities', label: 'Cities', icon: MapPin },
        { id: 'activities', label: 'Activities', icon: Globe },
        { id: 'users', label: 'Users', icon: Users },
    ]

    return (
        <div className="animate-fade-in">
            {/* Tabs Navigation */}
            <div className="mb-6 border-b border-gray-200 dark:border-slate-700">
                <div className="flex gap-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as AdminTab)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                                ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                                : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'overview' && <OverviewTab key="overview" />}
                {activeTab === 'trips' && <TripsTab key="trips" />}
                {activeTab === 'cities' && <CitiesTab key="cities" />}
                {activeTab === 'activities' && <ActivitiesTab key="activities" />}
                {activeTab === 'users' && <UsersTab key="users" />}
            </AnimatePresence>
        </div>
    )
}

// ... OverviewTab component ...

// Trips Tab
function TripsTab() {
    const [trips, setTrips] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        // Load custom trips from localStorage
        const stored = localStorage.getItem('globetrotter-trips')
        const customTrips = stored ? JSON.parse(stored) : []

        // Combine with JSON trips
        const allTrips = [
            ...customTrips.map((t: any) => ({ ...t, isCustom: true })),
            ...tripsData.trips.map((t: any) => ({ ...t, isCustom: false }))
        ]
        setTrips(allTrips)
    }, [])

    const filteredTrips = trips.filter(trip =>
        trip.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = (tripId: string, isCustom: boolean) => {
        if (!isCustom) {
            alert("Cannot delete demo data trips.")
            return
        }
        if (window.confirm('Are you sure you want to delete this trip?')) {
            const stored = localStorage.getItem('globetrotter-trips')
            if (stored) {
                const localTrips = JSON.parse(stored)
                const updated = localTrips.filter((t: any) => t.id !== tripId)
                localStorage.setItem('globetrotter-trips', JSON.stringify(updated))
                setTrips(prev => prev.filter(t => t.id !== tripId))
            }
        }
    }

    const getUserName = (userId: string) => {
        const user = usersData.users.find(u => u.id === userId)
        return user ? `${user.firstName} ${user.lastName}` : 'Unknown User'
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search trips..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input pl-9 py-2"
                    />
                </div>
            </div>

            <div className="card overflow-hidden dark:bg-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Trip Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Dates</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Budget</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredTrips.map(trip => (
                                <tr key={trip.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-slate-600 overflow-hidden">
                                                <img src={trip.coverImage || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200'} alt={trip.name} className="w-full h-full object-cover" />
                                            </div>
                                            <span className="font-medium text-dark-900 dark:text-white">{trip.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                                        {getUserName(trip.userId)}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                                        <div className="flex flex-col text-xs">
                                            <span>{new Date(trip.startDate).toLocaleDateString()}</span>
                                            <span className="text-gray-400">to {new Date(trip.endDate).toLocaleDateString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize 
                                            ${trip.status === 'ongoing' ? 'bg-emerald-100 text-emerald-700' :
                                                trip.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {trip.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                                        {trip.estimatedBudget ? `₹${trip.estimatedBudget.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            {/* We use a regular anchor tag or modify Link to fetch correct view logic if needed, 
                                                but here we can just link to the trip view. Note: Use `a` tag `href` if Router Link isn't imported, 
                                                but I'll reuse Link from imports if updated */}
                                            {/* Note: In top imports I didn't see Link inside AdminDashboard originally so I added it to imports above */}
                                            <Link to={`/trips/${trip.id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg text-gray-500 hover:text-blue-500 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            {trip.isCustom && (
                                                <button onClick={() => handleDelete(trip.id, true)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}

// Overview Tab
function OverviewTab() {
    const { overview, tripStats, popularCities, popularActivities } = analyticsData

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
        >
            {/* Stats Cards - Platform metrics only */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Trips', value: overview.totalTrips.toLocaleString(), icon: TrendingUp, color: 'from-orange-400 to-rose-500' },
                    { label: 'Cities Available', value: citiesData.cities.length, icon: MapPin, color: 'from-blue-400 to-indigo-500' },
                    { label: 'Activities', value: activitiesData.activities.length, icon: Globe, color: 'from-emerald-400 to-teal-500' },
                ].map((stat, i) => (
                    <div key={i} className="card p-6 dark:bg-slate-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">{stat.label}</p>
                                <p className="text-3xl font-bold text-dark-900 dark:text-white">{stat.value}</p>
                            </div>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Trips Chart */}
                <div className="card p-6 dark:bg-slate-800">
                    <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Trips Created</h3>
                    <div className="h-48 flex items-end gap-2">
                        {tripStats.monthlyTrips.map((m, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-gradient-to-t from-orange-500 to-rose-400 rounded-t-lg transition-all hover:from-orange-600 hover:to-rose-500"
                                    style={{ height: `${(m.trips / 2500) * 100}%` }}
                                />
                                <p className="text-xs text-gray-500 dark:text-slate-400 mt-2">{m.month}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Popular Cities */}
                <div className="card p-6 dark:bg-slate-800">
                    <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Popular Cities</h3>
                    <div className="space-y-3">
                        {popularCities.slice(0, 5).map((city, i) => (
                            <div key={city.cityId} className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                                <div className="flex-1">
                                    <p className="font-medium text-dark-900 dark:text-white">{city.name}</p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400">{city.visits.toLocaleString()} visits</p>
                                </div>
                                <span className={`text-sm font-medium ${city.change > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {city.change > 0 ? '+' : ''}{city.change}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popular Activities */}
            <div className="card p-6 dark:bg-slate-800">
                <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Top Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularActivities.slice(0, 6).map((act, i) => (
                        <div key={act.activityId} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <span className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center text-sm font-bold">{i + 1}</span>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-dark-900 dark:text-white truncate">{act.name}</p>
                                <p className="text-sm text-gray-500 dark:text-slate-400">{act.bookings.toLocaleString()} bookings</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}

// Cities Tab with CRUD
function CitiesTab() {
    const [cities, setCities] = useState(citiesData.cities)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingCity, setEditingCity] = useState<typeof cities[0] | null>(null)
    const [showModal, setShowModal] = useState(false)

    const filteredCities = cities.filter(city =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleDelete = (cityId: string) => {
        if (window.confirm('Are you sure you want to delete this city?')) {
            setCities(prev => prev.filter(c => c.id !== cityId))
        }
    }

    const handleSave = (city: typeof cities[0]) => {
        if (editingCity) {
            setCities(prev => prev.map(c => c.id === city.id ? city : c))
        } else {
            setCities(prev => [...prev, { ...city, id: `city-${Date.now()}` }])
        }
        setShowModal(false)
        setEditingCity(null)
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search cities..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input pl-9 py-2"
                    />
                </div>
                <button
                    onClick={() => { setEditingCity(null); setShowModal(true) }}
                    className="btn-primary"
                >
                    <Plus className="w-4 h-4" /> Add City
                </button>
            </div>

            {/* Cities Table */}
            <div className="card overflow-hidden dark:bg-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">City</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Country</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Region</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Avg Budget/Day</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Popularity</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredCities.map(city => (
                                <tr key={city.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={city.image} alt={city.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="font-medium text-dark-900 dark:text-white">{city.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{city.country}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400 capitalize">{city.region}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">₹{city.averageDailyBudget}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-20 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${city.popularity}%` }} />
                                            </div>
                                            <span className="text-sm text-gray-500 dark:text-slate-400">{city.popularity}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => { setEditingCity(city); setShowModal(true) }} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg text-gray-500 hover:text-blue-500 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(city.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            <CityModal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingCity(null) }}
                city={editingCity}
                onSave={handleSave}
            />
        </motion.div>
    )
}

// City Edit Modal
function CityModal({ isOpen, onClose, city, onSave }: {
    isOpen: boolean
    onClose: () => void
    city: typeof citiesData.cities[0] | null
    onSave: (city: typeof citiesData.cities[0]) => void
}) {
    const [formData, setFormData] = useState(city || {
        id: '',
        name: '',
        country: '',
        region: 'asia',
        description: '',
        image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
        highlights: [],
        costIndex: 2,
        popularity: 50,
        averageDailyBudget: 3000,
        bestTimeToVisit: '',
        timezone: '',
        currency: 'INR',
        language: 'English'
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-dark-900 dark:text-white">
                        {city ? 'Edit City' : 'Add New City'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1">Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            className="input"
                            placeholder="City name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1">Country</label>
                            <input
                                type="text"
                                value={formData.country}
                                onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
                                className="input"
                                placeholder="Country"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1">Region</label>
                            <select
                                value={formData.region}
                                onChange={e => setFormData(prev => ({ ...prev, region: e.target.value }))}
                                className="input"
                            >
                                {citiesData.regions.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="input resize-none"
                            rows={3}
                            placeholder="City description..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1">Avg Daily Budget (₹)</label>
                            <input
                                type="number"
                                value={formData.averageDailyBudget}
                                onChange={e => setFormData(prev => ({ ...prev, averageDailyBudget: parseInt(e.target.value) }))}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1">Popularity (%)</label>
                            <input
                                type="number"
                                value={formData.popularity}
                                onChange={e => setFormData(prev => ({ ...prev, popularity: parseInt(e.target.value) }))}
                                className="input"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                    <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
                    <button onClick={() => onSave(formData as typeof citiesData.cities[0])} className="btn-primary flex-1">
                        <Check className="w-4 h-4" /> Save
                    </button>
                </div>
            </div>
        </div>
    )
}

// Activities Tab with CRUD
function ActivitiesTab() {
    const [activities, setActivities] = useState(activitiesData.activities)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')

    const filteredActivities = activities.filter(act => {
        const matchesSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || act.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    const getCityName = (cityId: string) => citiesData.cities.find(c => c.id === cityId)?.name || ''

    const handleDelete = (actId: string) => {
        if (window.confirm('Are you sure you want to delete this activity?')) {
            setActivities(prev => prev.filter(a => a.id !== actId))
        }
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="flex gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input pl-9 py-2"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={e => setSelectedCategory(e.target.value)}
                        className="input py-2 w-40"
                    >
                        <option value="">All Categories</option>
                        {activitiesData.categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <button className="btn-primary">
                    <Plus className="w-4 h-4" /> Add Activity
                </button>
            </div>

            <div className="card overflow-hidden dark:bg-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Activity</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">City</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Duration</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Cost</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Rating</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredActivities.map(act => (
                                <tr key={act.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <img src={act.image} alt={act.name} className="w-10 h-10 rounded-lg object-cover" />
                                            <span className="font-medium text-dark-900 dark:text-white">{act.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{getCityName(act.cityId)}</td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-lg text-xs">{act.category}</span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{act.duration}h</td>
                                    <td className="px-4 py-3 text-orange-600 dark:text-orange-400 font-medium">₹{act.cost}</td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">⭐ {act.rating}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg text-gray-500 hover:text-blue-500 transition-colors">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg text-gray-500 hover:text-blue-500 transition-colors">
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDelete(act.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-500 hover:text-red-500 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}

// Users Tab with Management
function UsersTab() {
    const [users, setUsers] = useState(usersData.users.map(u => ({
        ...u,
        isActive: true // Add isActive if not present
    })))
    const [searchQuery, setSearchQuery] = useState('')

    const filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const toggleUserStatus = (userId: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, isActive: !u.isActive } : u
        ))
    }

    const updateRole = (userId: string, role: string) => {
        setUsers(prev => prev.map(u =>
            u.id === userId ? { ...u, role } : u
        ))
    }

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="input pl-9 py-2"
                    />
                </div>
            </div>

            <div className="card overflow-hidden dark:bg-slate-800">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-slate-700">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">User</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Email</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Role</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Joined</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                            {filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center text-white font-semibold text-sm">
                                                {user.firstName[0]}{user.lastName[0]}
                                            </div>
                                            <span className="font-medium text-dark-900 dark:text-white">{user.firstName} {user.lastName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{user.email}</td>
                                    <td className="px-4 py-3">
                                        <select
                                            value={user.role}
                                            onChange={e => updateRole(user.id, e.target.value)}
                                            className="px-2 py-1 bg-gray-100 dark:bg-slate-700 border-0 rounded-lg text-sm text-dark-900 dark:text-white focus:ring-2 focus:ring-orange-500"
                                        >
                                            <option value="traveler">Traveler</option>
                                            <option value="agency">Agency</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                            }`}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => toggleUserStatus(user.id)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${user.isActive
                                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100'
                                                    : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'
                                                    }`}
                                            >
                                                {user.isActive ? 'Deactivate' : 'Activate'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    )
}
