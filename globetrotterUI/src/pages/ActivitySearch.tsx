import { useState, useEffect } from 'react'
import { Search, Clock, Star, Plus, X, MapPin, Users, Tag, Check, Globe, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

interface Activity {
    id: string | number
    name: string
    description: string
    cityId?: string | number
    city_id?: string | number
    category: string
    duration: number
    cost?: number
    estimatedCost?: number
    estimated_cost?: number
    rating: number
    image?: string
    imageUrl?: string
    image_url?: string
    highlights?: string[]
}

// Helper to get activity cost (handles different field names from API and mock data)
const getActivityCost = (activity: Activity): number => {
    return activity.cost ?? activity.estimatedCost ?? activity.estimated_cost ?? 0
}

export default function ActivitySearch() {
    useAuth()
    const { activities, activityCategories, cities, trips, loadActivities, loadCities, loadTrips, isLoading } = useData()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedCity, setSelectedCity] = useState('')
    const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
    const [showAddToTrip, setShowAddToTrip] = useState(false)
    const [addedToTrip, setAddedToTrip] = useState<string | number | null>(null)

    useEffect(() => {
        loadActivities()
        loadCities()
        loadTrips()
    }, [])

    const userTrips = trips

    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !selectedCategory || activity.category?.toLowerCase() === selectedCategory.toLowerCase()
        const cityId = activity.cityId || activity.city_id
        const matchesCity = !selectedCity || String(cityId) === String(selectedCity)
        return matchesSearch && matchesCategory && matchesCity
    })

    const getCityName = (cityId: string | number | undefined) => {
        if (!cityId) return ''
        const city = cities.find(c => String(c.id) === String(cityId))
        return city?.name || ''
    }

    const getActivityImage = (activity: Activity) => activity.image || activity.imageUrl || activity.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'

    const handleAddToTrip = (tripId: string | number) => {
        setAddedToTrip(tripId)
        setTimeout(() => {
            setShowAddToTrip(false)
            setAddedToTrip(null)
        }, 1500)
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        )
    }

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl shadow-lg">
                        <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-brandDark-900 dark:text-white">Activities</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Find experiences for your trip</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-brandDark-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search activities..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-brandDark-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <select
                        value={selectedCity}
                        onChange={e => setSelectedCity(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-brandDark-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full lg:w-48"
                    >
                        <option value="">All Cities</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                    </select>
                    <div className="flex gap-2 flex-wrap">
                        {activityCategories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
                                className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${selectedCategory === cat.name
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-slate-700 text-brandDark-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
                {filteredActivities.map(activity => {
                    const cityId = activity.cityId || activity.city_id
                    return (
                        <div
                            key={activity.id}
                            onClick={() => setSelectedActivity(activity as Activity)}
                            className="bg-white dark:bg-brandDark-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 group hover:shadow-lg transition-all cursor-pointer border border-gray-100 dark:border-slate-700"
                        >
                            <img src={getActivityImage(activity as Activity)} alt={activity.name} className="w-full md:w-48 h-32 rounded-xl object-cover" />
                            <div className="flex-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <span className="inline-block px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-medium mb-1">
                                            {activity.category}
                                        </span>
                                        <h3 className="font-semibold text-brandDark-900 dark:text-white text-lg">{activity.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {getCityName(cityId)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-teal-600 dark:text-teal-400">₹{getActivityCost(activity as Activity)}</p>
                                        <p className="text-sm text-gray-500 dark:text-slate-400">per person</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-slate-400 mt-2 line-clamp-2">{activity.description}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex gap-4 text-sm text-gray-500 dark:text-slate-400">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{activity.duration}h</span>
                                        <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-amber-400 text-amber-400" />{activity.rating}</span>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedActivity(activity as Activity)
                                            setShowAddToTrip(true)
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />Add
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filteredActivities.length === 0 && (
                <div className="text-center py-16">
                    <Globe className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-brandDark-900 dark:text-white mb-2">No activities found</h3>
                    <p className="text-gray-500 dark:text-slate-400">Try adjusting your filters</p>
                </div>
            )}

            {/* Activity Detail Modal */}
            {selectedActivity && !showAddToTrip && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedActivity(null)}>
                    <div className="bg-white dark:bg-brandDark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        {/* Image Header */}
                        <div className="relative h-56 overflow-hidden">
                            <img src={getActivityImage(selectedActivity)} alt={selectedActivity.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <div className="absolute top-4 left-4">
                                <span className="px-3 py-1 bg-teal-500 text-white rounded-full text-sm font-medium">
                                    {selectedActivity.category}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h2 className="text-2xl font-bold text-white mb-1">{selectedActivity.name}</h2>
                                <p className="text-white/80 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />{getCityName(selectedActivity.cityId || selectedActivity.city_id)}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                    <Clock className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                                    <p className="text-lg font-semibold text-brandDark-900 dark:text-white">{selectedActivity.duration}h</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Duration</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                    <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <p className="text-lg font-semibold text-brandDark-900 dark:text-white">{selectedActivity.rating}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Rating</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                    <Users className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <p className="text-lg font-semibold text-brandDark-900 dark:text-white">₹{getActivityCost(selectedActivity)}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Per Person</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-brandDark-900 dark:text-white mb-2">About this activity</h3>
                                <p className="text-gray-600 dark:text-slate-400">{selectedActivity.description}</p>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full text-sm">
                                    <Tag className="w-3 h-3" />
                                    {selectedActivity.category}
                                </span>
                                <span className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full text-sm">
                                    <MapPin className="w-3 h-3" />
                                    {getCityName(selectedActivity.cityId || selectedActivity.city_id)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => setSelectedActivity(null)}
                                className="flex-1 py-3 bg-gray-100 dark:bg-slate-700 text-brandDark-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => setShowAddToTrip(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add to Itinerary
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add to Trip Modal */}
            {showAddToTrip && selectedActivity && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddToTrip(false)}>
                    <div className="bg-white dark:bg-brandDark-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-brandDark-900 dark:text-white">Add to Itinerary</h3>
                            <button onClick={() => setShowAddToTrip(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {userTrips.length > 0 ? (
                                <div className="space-y-2">
                                    {userTrips.map(trip => {
                                        const coverImage = trip.coverImage || trip.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
                                        const startDate = trip.startDate || trip.start_date
                                        const endDate = trip.endDate || trip.end_date
                                        return (
                                            <button
                                                key={trip.id}
                                                onClick={() => handleAddToTrip(trip.id)}
                                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all ${addedToTrip === trip.id
                                                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                                    : 'border-gray-200 dark:border-slate-600 hover:border-teal-300 hover:bg-gray-50 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                                                    <img src={coverImage} alt={trip.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-brandDark-900 dark:text-white">{trip.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-slate-400">
                                                        {new Date(startDate).toLocaleDateString()} - {new Date(endDate).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                {addedToTrip === trip.id && (
                                                    <Check className="w-5 h-5 text-teal-500" />
                                                )}
                                            </button>
                                        )
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <MapPin className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-slate-400 mb-4">No trips yet</p>
                                    <Link
                                        to="/trips/new"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Create New Trip
                                    </Link>
                                </div>
                            )}
                        </div>
                        {userTrips.length > 0 && (
                            <div className="p-4 border-t border-gray-100 dark:border-slate-700">
                                <Link
                                    to="/trips/new"
                                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-400 rounded-xl hover:border-teal-400 hover:text-teal-600 transition-colors font-medium"
                                >
                                    <Plus className="w-5 h-5" />
                                    Create New Trip
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
