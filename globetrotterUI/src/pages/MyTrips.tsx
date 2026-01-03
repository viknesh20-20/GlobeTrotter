import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { PlusCircle, MapPin, Calendar, Eye, Trash2, Search, Edit3, DollarSign, Plane, Loader2 } from 'lucide-react'

type TripStatus = 'all' | 'ongoing' | 'upcoming' | 'completed'

export default function MyTrips() {
    useAuth()
    const { trips, cities, loadTrips, deleteTrip, isLoading } = useData()
    const [activeTab, setActiveTab] = useState<TripStatus>('all')
    const [searchQuery, setSearchQuery] = useState('')

    // Load trips when component mounts
    useEffect(() => {
        loadTrips()
    }, [])

    // Helper to get status based on dates
    const getStatus = (startDate: string, endDate: string): 'upcoming' | 'ongoing' | 'completed' => {
        const now = new Date()
        const start = new Date(startDate)
        const end = new Date(endDate)
        
        if (end < now) return 'completed'
        if (start <= now && end >= now) return 'ongoing'
        return 'upcoming'
    }

    // Map trips to include computed status
    const allTrips = trips.map(trip => {
        const startDate = trip.startDate || trip.start_date || ''
        const endDate = trip.endDate || trip.end_date || ''
        const coverImage = trip.coverImage || trip.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
        
        return {
            ...trip,
            startDate,
            endDate,
            coverImage,
            status: getStatus(startDate, endDate),
            estimatedBudget: trip.estimatedBudget || trip.estimated_budget || 0,
            description: trip.description || '',
            cities: trip.cities || [],
            isCustom: true // All trips from API can be deleted
        }
    })

    // Filter by tab and search
    const filteredTrips = allTrips.filter(trip => {
        const matchesTab = activeTab === 'all' || trip.status === activeTab
        const matchesSearch = trip.name.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesTab && matchesSearch
    })

    // Get city data - support both API format and JSON format
    const getCityData = (cityId: string | { id: string; name: string }) => {
        // If cityId is already an object (from API), return it
        if (typeof cityId === 'object' && cityId !== null) {
            return cityId
        }
        // Otherwise find in cities array
        return cities.find(c => c.id === cityId || c.id === parseInt(cityId as string))
    }

    // Tab counts
    const tabs: { id: TripStatus; label: string; count: number }[] = [
        { id: 'all', label: 'All', count: allTrips.length },
        { id: 'ongoing', label: 'Ongoing', count: allTrips.filter(t => t.status === 'ongoing').length },
        { id: 'upcoming', label: 'Upcoming', count: allTrips.filter(t => t.status === 'upcoming').length },
        { id: 'completed', label: 'Completed', count: allTrips.filter(t => t.status === 'completed').length },
    ]

    const handleDeleteTrip = async (tripId: string | number, isCustom: boolean) => {
        if (isCustom) {
            await deleteTrip(String(tripId))
        }
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header with Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                {/* Tab Filters */}
                <div className="flex bg-gray-100 dark:bg-brandDark-800 rounded-xl p-1">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                ? 'bg-white dark:bg-brandDark-700 text-brandDark-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-brandDark-400 hover:text-brandDark-900 dark:hover:text-white'
                                }`}
                        >
                            {tab.label}
                            {tab.count > 0 && (
                                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${activeTab === tab.id
                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                                    : 'bg-gray-200 dark:bg-brandDark-600 text-gray-600 dark:text-brandDark-400'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search trips..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="input pl-9 py-2"
                        />
                    </div>

                    {/* New Trip Button */}
                    <Link to="/trips/new" className="btn-primary whitespace-nowrap">
                        <PlusCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">New Trip</span>
                    </Link>
                </div>
            </div>

            {/* Trips List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            ) : (
            <AnimatePresence mode="wait">
                {filteredTrips.length === 0 ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="card p-12 text-center dark:bg-brandDark-800"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-brandDark-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-10 h-10 text-gray-400 dark:text-brandDark-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-brandDark-900 dark:text-white mb-2">
                            {searchQuery ? 'No trips found' : 'No trips yet'}
                        </h3>
                        <p className="text-gray-500 dark:text-brandDark-400 mb-6">
                            {searchQuery ? 'Try a different search term' : 'Start planning your first adventure!'}
                        </p>
                        {!searchQuery && (
                            <Link to="/trips/new" className="btn-primary inline-flex">
                                <PlusCircle className="w-5 h-5" />
                                Plan Your First Trip
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="trips"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid gap-4"
                    >
                        {/* Group by status when showing all */}
                        {activeTab === 'all' ? (
                            <>
                                {['ongoing', 'upcoming', 'completed'].map(status => {
                                    const statusTrips = filteredTrips.filter(t => t.status === status)
                                    if (statusTrips.length === 0) return null

                                    return (
                                        <div key={status}>
                                            <h3 className="text-lg font-semibold text-brandDark-900 dark:text-white mb-3 capitalize">{status}</h3>
                                            <div className="grid gap-3">
                                                {statusTrips.map((trip, index) => (
                                                    <motion.div
                                                        key={trip.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                    >
                                                        <TripCard
                                                            trip={trip}
                                                            getCityData={getCityData}
                                                            onDelete={(id) => handleDeleteTrip(id, trip.isCustom)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </>
                        ) : (
                            <div className="grid gap-3">
                                {filteredTrips.map((trip, index) => (
                                    <motion.div
                                        key={trip.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <TripCard
                                            trip={trip}
                                            getCityData={getCityData}
                                            onDelete={(id) => handleDeleteTrip(id, trip.isCustom)}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
            )}
        </div>
    )
}

// Trip Card Component
interface TripCardProps {
    trip: {
        id: string | number
        name: string
        coverImage: string
        startDate: string
        endDate: string
        description: string
        cities: (string | { id: string | number; name: string })[]
        status: string
        estimatedBudget?: number
        isCustom: boolean
    }
    getCityData: (id: string | { id: string; name: string }) => { name?: string } | undefined
    onDelete: (id: string) => void
}

function TripCard({ trip, getCityData, onDelete }: TripCardProps) {
    const statusColors = {
        ongoing: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
        upcoming: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
        completed: 'bg-gray-100 dark:bg-brandDark-700 text-gray-700 dark:text-brandDark-300',
    }

    const getDaysInfo = () => {
        const now = new Date()
        const start = new Date(trip.startDate)
        const end = new Date(trip.endDate)
        const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

        if (trip.status === 'upcoming') {
            const daysUntil = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            return `Starts in ${daysUntil} days • ${duration} day trip`
        }
        return `${duration} days`
    }

    return (
        <div className="card p-4 flex flex-col sm:flex-row gap-4 group hover:shadow-lg transition-all dark:bg-brandDark-800">
            {/* Trip Image */}
            <div className="w-full sm:w-44 h-32 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 relative">
                <img
                    src={trip.coverImage}
                    alt={trip.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-2 left-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[trip.status as keyof typeof statusColors]}`}>
                        {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Trip Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-brandDark-900 dark:text-white text-lg truncate">{trip.name}</h3>
                        {trip.description && (
                            <p className="text-sm text-gray-500 dark:text-brandDark-400 line-clamp-1 mb-2">{trip.description}</p>
                        )}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-brandDark-400">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {trip.cities.length > 0
                                    ? trip.cities.map(city => {
                                        if (typeof city === 'object' && city !== null) {
                                            return city.name
                                        }
                                        const cityData = getCityData(city)
                                        return cityData?.name
                                    }).filter(Boolean).join(', ') || 'No destinations'
                                    : 'No destinations'
                                }
                            </span>
                            {trip.estimatedBudget && trip.estimatedBudget > 0 && (
                                <span className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-medium">
                                    <DollarSign className="w-4 h-4" />
                                    ₹{trip.estimatedBudget.toLocaleString()}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 dark:text-brandDark-500 mt-2 flex items-center gap-1">
                            <Plane className="w-3 h-3" />
                            {getDaysInfo()}
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                            to={`/trips/${trip.id}`}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-brandDark-400 hover:text-orange-500 transition-colors"
                            title="View"
                        >
                            <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                            to={`/trips/${trip.id}/edit`}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-brandDark-400 hover:text-blue-500 transition-colors"
                            title="Edit"
                        >
                            <Edit3 className="w-4 h-4" />
                        </Link>
                        {trip.isCustom && (
                            <button
                                onClick={() => onDelete(String(trip.id))}
                                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-600 dark:text-brandDark-400 hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
