import { useState, useEffect } from 'react'
import { Search, MapPin, Star, DollarSign, Plus, Heart, X, Clock, Utensils, Camera, Compass, Check, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

interface City {
    id: string | number
    name: string
    country: string
    region: string
    description: string
    image?: string
    imageUrl?: string
    image_url?: string
    highlights: string[]
    costIndex?: number
    cost_index?: number
    popularity?: number
    rating?: number
    averageDailyBudget?: number
    average_daily_budget?: number
    bestTimeToVisit?: string
    best_time_to_visit?: string
    timezone?: string
    currency?: string
    language?: string
}

export default function CitySearch() {
    useAuth()
    const { cities, trips, regions, loadCities, loadTrips, isLoading } = useData()
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedRegion, setSelectedRegion] = useState('')
    const [savedCities, setSavedCities] = useState<(string | number)[]>([])
    const [selectedCity, setSelectedCity] = useState<City | null>(null)
    const [showAddToTrip, setShowAddToTrip] = useState(false)
    const [addedToTrip, setAddedToTrip] = useState<string | number | null>(null)

    useEffect(() => {
        loadCities()
        loadTrips()
    }, [])

    const userTrips = trips

    const filteredCities = cities.filter(city => {
        const matchesSearch = city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            city.country.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesRegion = !selectedRegion || city.region?.toLowerCase() === selectedRegion.toLowerCase()
        return matchesSearch && matchesRegion
    })

    const toggleSave = (cityId: string | number, e?: React.MouseEvent) => {
        e?.stopPropagation()
        setSavedCities(prev => prev.includes(cityId) ? prev.filter(id => id !== cityId) : [...prev, cityId])
    }

    const handleAddToTrip = (tripId: string | number) => {
        setAddedToTrip(tripId)
        setTimeout(() => {
            setShowAddToTrip(false)
            setAddedToTrip(null)
        }, 1500)
    }

    // Helper to get image from city
    const getCityImage = (city: City) => city.image || city.imageUrl || city.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
    
    // Helper to get cost index
    const getCostIndex = (city: City) => city.costIndex || city.cost_index || 2
    
    // Helper to get popularity/rating
    const getPopularity = (city: City) => city.popularity || city.rating || 80
    
    // Helper to get daily budget
    const getDailyBudget = (city: City) => city.averageDailyBudget || city.average_daily_budget || 3000
    
    // Helper to get best time to visit
    const getBestTime = (city: City) => city.bestTimeToVisit || city.best_time_to_visit || 'Year-round'

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
                        <Compass className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-brandDark-900 dark:text-white">Explore Cities</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Discover your next destination</p>
                    </div>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white dark:bg-brandDark-800 rounded-2xl p-4 mb-6 shadow-sm border border-gray-100 dark:border-slate-700">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search cities, countries..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-brandDark-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        {regions.map(region => (
                            <button
                                key={region.id}
                                onClick={() => setSelectedRegion(selectedRegion === region.id ? '' : region.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedRegion === region.id
                                    ? 'bg-teal-500 text-white shadow-md'
                                    : 'bg-gray-100 dark:bg-slate-700 text-brandDark-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                {region.emoji} {region.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCities.map(city => (
                    <div
                        key={city.id}
                        onClick={() => setSelectedCity(city as City)}
                        className="bg-white dark:bg-brandDark-800 rounded-2xl overflow-hidden group cursor-pointer shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all"
                    >
                        <div className="aspect-video relative overflow-hidden">
                            <img src={getCityImage(city as City)} alt={city.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <button
                                onClick={(e) => toggleSave(city.id, e)}
                                className="absolute top-3 right-3 p-2 bg-white/90 dark:bg-slate-900/90 rounded-full shadow-md hover:bg-white dark:hover:bg-slate-800 transition-colors"
                            >
                                <Heart className={`w-5 h-5 ${savedCities.includes(city.id) ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-slate-400'}`} />
                            </button>
                            <div className="absolute bottom-3 left-3 flex gap-2">
                                <span className="px-2 py-1 bg-white/90 dark:bg-slate-900/90 rounded-lg text-xs font-medium flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {getPopularity(city as City)}%
                                </span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <h3 className="font-semibold text-brandDark-900 dark:text-white text-lg">{city.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />{city.country}
                                    </p>
                                </div>
                                <span className="px-2 py-1 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 rounded-lg text-xs font-medium flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {'₹'.repeat(getCostIndex(city as City))}
                                </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 mb-3">{city.description}</p>
                            <div className="flex flex-wrap gap-1 mb-4">
                                {(city.highlights || []).slice(0, 3).map((h: string, i: number) => (
                                    <span key={i} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 px-2 py-1 rounded-full">{h}</span>
                                ))}
                            </div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-slate-400">~₹{getDailyBudget(city as City)}/day</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedCity(city as City)
                                        setShowAddToTrip(true)
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-teal-500 hover:bg-teal-600 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    <Plus className="w-4 h-4" />Add
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredCities.length === 0 && (
                <div className="text-center py-16">
                    <MapPin className="w-16 h-16 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-brandDark-900 dark:text-white mb-2">No cities found</h3>
                    <p className="text-gray-500 dark:text-slate-400">Try adjusting your search or filters</p>
                </div>
            )}

            {/* City Detail Modal */}
            {selectedCity && !showAddToTrip && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedCity(null)}>
                    <div className="bg-white dark:bg-brandDark-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        {/* Image Header */}
                        <div className="relative h-64 overflow-hidden">
                            <img src={getCityImage(selectedCity)} alt={selectedCity.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <button
                                onClick={() => setSelectedCity(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <div className="absolute bottom-4 left-4 right-4">
                                <h2 className="text-3xl font-bold text-white mb-1">{selectedCity.name}</h2>
                                <p className="text-white/80 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />{selectedCity.country}
                                </p>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[50vh]">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                    <Star className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                                    <p className="text-lg font-semibold text-brandDark-900 dark:text-white">{getPopularity(selectedCity)}%</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Popularity</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                    <DollarSign className="w-5 h-5 text-teal-500 mx-auto mb-1" />
                                    <p className="text-lg font-semibold text-brandDark-900 dark:text-white">₹{getDailyBudget(selectedCity)}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Per Day</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                    <Clock className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                                    <p className="text-sm font-semibold text-brandDark-900 dark:text-white">{getBestTime(selectedCity)}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Best Time</p>
                                </div>
                                <div className="p-3 bg-gray-50 dark:bg-slate-700 rounded-xl text-center">
                                    <Utensils className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                                    <p className="text-sm font-semibold text-brandDark-900 dark:text-white">{selectedCity.currency || 'Local'}</p>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">Currency</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-brandDark-900 dark:text-white mb-2">About</h3>
                                <p className="text-gray-600 dark:text-slate-400">{selectedCity.description}</p>
                            </div>

                            {/* Highlights */}
                            <div className="mb-6">
                                <h3 className="font-semibold text-brandDark-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Camera className="w-4 h-4 text-teal-500" />
                                    Highlights
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {(selectedCity.highlights || []).map((h, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400 rounded-full text-sm font-medium">
                                            {h}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex gap-3">
                            <button
                                onClick={() => toggleSave(selectedCity.id)}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${savedCities.includes(selectedCity.id)
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                                    : 'bg-gray-100 dark:bg-slate-700 text-brandDark-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-600'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${savedCities.includes(selectedCity.id) ? 'fill-current' : ''}`} />
                                {savedCities.includes(selectedCity.id) ? 'Saved' : 'Save'}
                            </button>
                            <button
                                onClick={() => setShowAddToTrip(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-medium transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Add to Trip
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add to Trip Modal */}
            {showAddToTrip && selectedCity && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAddToTrip(false)}>
                    <div className="bg-white dark:bg-brandDark-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-brandDark-900 dark:text-white">Add {selectedCity.name} to Trip</h3>
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
