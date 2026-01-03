import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, DollarSign, Clock, Edit3, Share2, Heart, ChevronRight, Activity } from 'lucide-react'
import { useData } from '../context/DataContext'
import tripsData from '../data/trips.json'
import citiesData from '../data/cities.json'
import itinerariesData from '../data/itineraries.json'
import activitiesData from '../data/activities.json'

interface StoredTrip {
    id: string
    userId: string
    name: string
    coverImage: string
    cover_image?: string
    startDate: string
    start_date?: string
    endDate: string
    end_date?: string
    description?: string
    cities: string[]
    status: string
    estimatedBudget?: number
    totalBudget?: number
    activities?: string[]
}

export default function ItineraryView() {
    const { id } = useParams()
    const { trips, loadTrips } = useData()
    const [activeDay, setActiveDay] = useState(1)
    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
    const [trip, setTrip] = useState<StoredTrip | null>(null)

    useEffect(() => {
        loadTrips()
    }, [])

    useEffect(() => {
        // First check DataContext trips (from API or mock)
        const apiTrip = trips.find(t => String(t.id) === id)
        if (apiTrip) {
            // Normalize field names
            setTrip({
                ...apiTrip,
                id: apiTrip.id,
                userId: apiTrip.userId || apiTrip.user_id || 'unknown',
                name: apiTrip.name,
                coverImage: apiTrip.coverImage || apiTrip.cover_image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
                startDate: apiTrip.startDate || apiTrip.start_date,
                endDate: apiTrip.endDate || apiTrip.end_date,
                description: apiTrip.description,
                cities: apiTrip.cities || [],
                status: apiTrip.status || 'upcoming',
                estimatedBudget: apiTrip.estimatedBudget || apiTrip.estimated_budget,
                totalBudget: apiTrip.totalBudget || apiTrip.total_budget,
                activities: apiTrip.activities || []
            } as StoredTrip)
            return
        }

        // Then check JSON data
        const jsonTrip = tripsData.trips.find(t => t.id === id)
        if (jsonTrip) {
            setTrip(jsonTrip as StoredTrip)
            return
        }

        // Finally check localStorage
        const storedTrips = JSON.parse(localStorage.getItem('globetrotter-trips') || '[]')
        const storedTrip = storedTrips.find((t: StoredTrip) => t.id === id)
        if (storedTrip) {
            setTrip(storedTrip)
        }
    }, [id, trips])

    // Try to find itinerary in static data or localStorage
    const [itinerary, setItinerary] = useState<any>(null)

    useEffect(() => {
        if (!trip) return

        // 1. Check static data
        const staticItinerary = itinerariesData.itineraries.find(i => i.tripId === id)
        if (staticItinerary) {
            setItinerary(staticItinerary)
            return
        }

        // 2. Check localStorage
        const storedItineraries = JSON.parse(localStorage.getItem('globetrotter-itineraries') || '[]')
        const storedItinerary = storedItineraries.find((i: any) => i.tripId === id)
        if (storedItinerary) {
            setItinerary(storedItinerary)
            return
        }

        // 3. Generate default itinerary from trip data
        const start = new Date(trip.startDate)
        const end = new Date(trip.endDate)
        const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1

        // Distribute days among cities
        const daysPerCity = Math.ceil(dayCount / (trip.cities.length || 1))

        const stops = trip.cities.map((cityId, index) => {
            const cityDays = []
            for (let i = 0; i < daysPerCity; i++) {
                const dayNum = index * daysPerCity + i + 1
                if (dayNum > dayCount) break;

                const date = new Date(start)
                date.setDate(start.getDate() + dayNum - 1)

                // Add selected activities to first day of city or spread them
                const cityActs = trip.activities ? activitiesData.activities.filter(a => a.cityId === cityId && trip.activities?.includes(a.id)) : []
                const dayActs = i === 0 ? cityActs.map(a => ({
                    activityId: a.id,
                    startTime: "10:00 AM",
                    endTime: "12:00 PM",
                    cost: a.cost,
                    notes: "Planned activity"
                })) : []

                cityDays.push({
                    dayNumber: dayNum,
                    date: date.toISOString().split('T')[0],
                    activities: dayActs
                })
            }
            return {
                cityId,
                days: cityDays
            }
        }).filter(s => s.days.length > 0)

        const defaultItinerary = {
            tripId: id,
            totalCost: {
                accommodation: 0,
                food: 0,
                transport: 0,
                activities: 0,
                other: 0,
                grand: 0
            },
            stops
        }

        setItinerary(defaultItinerary)
    }, [trip, id])

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500">Trip not found</p>
                <Link to="/trips" className="btn-primary mt-4">Back to My Trips</Link>
            </div>
        )
    }

    const getCityData = (cityId: string) => citiesData.cities.find(c => c.id === cityId)
    const getActivityData = (actId: string) => activitiesData.activities.find(a => a.id === actId)

    // Get all days from itinerary - deduplicate by date to avoid duplicate day tabs
    const allDaysRaw = itinerary?.stops.flatMap((stop: any) => stop.days) || []
    // Deduplicate by date and sort by dayNumber
    const allDays = allDaysRaw.reduce((acc: any[], day: any) => {
        if (!acc.find(d => d.date === day.date)) {
            acc.push(day)
        } else {
            // Merge activities from duplicate days
            const existing = acc.find(d => d.date === day.date)
            if (existing && day.activities) {
                existing.activities = [...(existing.activities || []), ...day.activities]
            }
        }
        return acc
    }, []).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
    // Re-number days sequentially
    allDays.forEach((day: any, index: number) => {
        day.dayNumber = index + 1
    })

    // Following Screen 9: Itinerary for a selected place with Day tabs and expense breakdown

    // Helper to parse date string properly
    const parseDate = (dateStr: string) => {
        if (!dateStr) return new Date()

        // Try native Date parsing first
        const nativeDate = new Date(dateStr)
        if (!isNaN(nativeDate.getTime())) {
            return nativeDate
        }

        // Try YYYY-MM-DD format
        if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
            const parts = dateStr.split('-').map(Number)
            if (parts.length === 3) {
                return new Date(parts[0], parts[1] - 1, parts[2])
            }
        }

        // Try DD/MM/YYYY format
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/').map(Number)
            if (parts.length === 3) {
                // Assume DD/MM/YYYY
                return new Date(parts[2], parts[1] - 1, parts[0])
            }
        }

        // Fallback to current date
        return new Date()
    }

    return (
        <div className="animate-fade-in">
            {/* Trip Header */}
            <div className="card overflow-hidden mb-6">
                <div className="h-48 relative">
                    <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={
                                trip.status === 'ongoing' ? 'status-ongoing' :
                                    trip.status === 'upcoming' ? 'status-upcoming' : 'status-completed'
                            }>
                                {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                            </span>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{trip.name}</h1>
                        <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {parseDate(trip.startDate).toLocaleDateString()} - {parseDate(trip.endDate).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {trip.cities.map(c => getCityData(c)?.name).filter(Boolean).join(' → ')}
                            </span>
                        </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="absolute top-4 right-4 flex gap-2">
                        <Link to={`/trips/${id}/edit`} className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors">
                            <Edit3 className="w-5 h-5 text-white" />
                        </Link>
                        <button className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors">
                            <Share2 className="w-5 h-5 text-white" />
                        </button>
                        <button className="p-2 bg-white/20 backdrop-blur rounded-lg hover:bg-white/30 transition-colors">
                            <Heart className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Title */}
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-dark-900 dark:text-white">Itinerary for a selected place</h2>
                        <div className="flex bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-600 shadow-sm dark:text-white' : 'text-dark-600 dark:text-slate-400'}`}
                            >
                                List
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${viewMode === 'calendar' ? 'bg-white dark:bg-slate-600 shadow-sm dark:text-white' : 'text-dark-600 dark:text-slate-400'}`}
                            >
                                Calendar
                            </button>
                        </div>
                    </div>

                    {viewMode === 'list' ? (
                        <>
                            {/* Day Tabs */}
                            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                                {allDays.map((day: any) => (
                                    <button
                                        key={day.date}
                                        onClick={() => setActiveDay(day.dayNumber)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl font-medium transition-all ${activeDay === day.dayNumber
                                            ? 'bg-orange-500 text-white shadow-md'
                                            : 'bg-gray-100 dark:bg-slate-700 text-dark-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                                            }`}
                                    >
                                        Day {day.dayNumber}
                                    </button>
                                ))}
                            </div>

                            {/* Day Content */}
                            {allDays.filter((d: any) => d.dayNumber === activeDay).map((day: any, index: number) => (
                                <div key={`${day.date}-${index}`} className="card p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-dark-900 dark:text-white">Day {day.dayNumber}</h3>
                                            <p className="text-sm text-gray-500 dark:text-slate-400">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                                        </div>
                                        <span className="badge-primary">Physical Activity</span>
                                    </div>

                                    {/* Activities */}
                                    <div className="space-y-4">
                                        {day.activities.length > 0 ? (
                                            day.activities.map((scheduledAct: any, actIndex: number) => {
                                                const activity = getActivityData(scheduledAct.activityId)
                                                if (!activity) return null
                                                return (
                                                    <div key={actIndex} className="flex gap-4 p-4 bg-gray-50 dark:bg-slate-700 rounded-xl">
                                                        <img src={activity.image} alt={activity.name} className="w-20 h-20 rounded-lg object-cover" />
                                                        <div className="flex-1">
                                                            <h4 className="font-semibold text-dark-900 dark:text-white">{activity.name}</h4>
                                                            <p className="text-sm text-gray-500 dark:text-slate-400 mb-2">{activity.description}</p>
                                                            <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-slate-400">
                                                                <span className="flex items-center gap-1">
                                                                    <Clock className="w-4 h-4" />
                                                                    {scheduledAct.startTime} - {scheduledAct.endTime}
                                                                </span>
                                                                <span className="flex items-center gap-1">
                                                                    <DollarSign className="w-4 h-4" />
                                                                    ₹{scheduledAct.cost}
                                                                </span>
                                                            </div>
                                                            {scheduledAct.notes && (
                                                                <p className="text-sm text-primary-600 mt-2">📝 {scheduledAct.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        ) : (
                                            <div className="text-center py-8 text-gray-500 dark:text-slate-400">
                                                <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
                                                <p>No activities scheduled for this day</p>
                                                <Link to={`/trips/${id}/edit`} className="text-orange-500 hover:underline text-sm">
                                                    Add activities →
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : (
                        /* Calendar Grid View - Full Month Logic */
                        <div className="space-y-6">
                            {(() => {
                                // Helper to parse date string properly
                                const parseDate = (dateStr: string) => {
                                    if (!dateStr) return new Date()

                                    // Try native Date parsing first
                                    const nativeDate = new Date(dateStr)
                                    if (!isNaN(nativeDate.getTime())) {
                                        return nativeDate
                                    }

                                    // Try YYYY-MM-DD format
                                    if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                                        const parts = dateStr.split('-').map(Number)
                                        if (parts.length === 3) {
                                            return new Date(parts[0], parts[1] - 1, parts[2])
                                        }
                                    }

                                    // Try DD/MM/YYYY format
                                    if (dateStr.includes('/')) {
                                        const parts = dateStr.split('/').map(Number)
                                        if (parts.length === 3) {
                                            // Assume DD/MM/YYYY
                                            return new Date(parts[2], parts[1] - 1, parts[0])
                                        }
                                    }

                                    // Fallback to current date
                                    return new Date()
                                }

                                // Identify months
                                const months: string[] = []
                                const start = parseDate(trip.startDate)
                                const end = parseDate(trip.endDate)

                                // Ensure we have valid dates
                                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                                    return <p className="text-gray-500">Invalid trip dates</p>
                                }

                                const current = new Date(start)
                                current.setDate(1) // Start at the beginning of the start month

                                while (current <= end || (current.getMonth() === end.getMonth() && current.getFullYear() === end.getFullYear())) {
                                    const yearNum = current.getFullYear()
                                    const monthNum = current.getMonth() + 1 // 1-indexed
                                    months.push(`${yearNum}-${String(monthNum).padStart(2, '0')}`)
                                    current.setMonth(current.getMonth() + 1)
                                }

                                return months.map(monthStr => {
                                    const [year, month] = monthStr.split('-').map(Number)
                                    const daysInMonth = new Date(year, month, 0).getDate()
                                    const firstDayOfMonth = new Date(year, month - 1, 1).getDay()

                                    return (
                                        <div key={monthStr} className="card p-6">
                                            <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">
                                                {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                            </h3>
                                            <div className="grid grid-cols-7 gap-2 mb-2">
                                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                                    <div key={day} className="text-center text-xs font-semibold text-gray-400 py-1">
                                                        {day}
                                                    </div>
                                                ))}

                                                {/* Empty cells for padding */}
                                                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                                    <div key={`empty-${i}`} className="aspect-square bg-transparent" />
                                                ))}

                                                {/* Days of the month */}
                                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                                    const dayNum = i + 1
                                                    const dateStr = `${monthStr}-${String(dayNum).padStart(2, '0')}`

                                                    // Find if this date is in our itinerary
                                                    const itineraryDay = allDays.find((d: any) => d.date === dateStr)
                                                    const hasActivities = itineraryDay ? itineraryDay.activities.length > 0 : false
                                                    const isSelected = itineraryDay && activeDay === itineraryDay.dayNumber
                                                    const isTripDate = dateStr >= trip.startDate && dateStr <= trip.endDate

                                                    return (
                                                        <button
                                                            key={dateStr}
                                                            disabled={!itineraryDay}
                                                            onClick={() => {
                                                                if (itineraryDay) {
                                                                    setActiveDay(itineraryDay.dayNumber)
                                                                    setViewMode('list')
                                                                }
                                                            }}
                                                            className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative transition-all
                                                                ${isSelected
                                                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 shadow-md'
                                                                    : isTripDate && !itineraryDay
                                                                        ? 'border-dashed border-gray-300 bg-gray-50 text-gray-400' // Trip date but no itinerary?
                                                                        : itineraryDay
                                                                            ? 'border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 text-dark-700 dark:text-slate-300 hover:border-orange-200 hover:shadow-sm'
                                                                            : 'border-transparent text-gray-300 dark:text-slate-600 bg-transparent cursor-default'
                                                                }
                                                            `}
                                                        >
                                                            <span className="font-semibold text-sm md:text-lg">{dayNum}</span>
                                                            {hasActivities && (
                                                                <div className="flex gap-0.5 mt-1">
                                                                    {itineraryDay.activities.slice(0, 3).map((_: any, idx: number) => (
                                                                        <div key={idx} className="w-1 h-1 md:w-1.5 md:h-1.5 rounded-full bg-orange-500" />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                            })()}
                        </div>
                    )}
                </div>

                {/* Sidebar - Expenses - Following Screen 9 */}
                <div className="space-y-6">
                    {/* Expenses Card */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Expenses</h3>

                        {itinerary?.totalCost && (
                            <div className="space-y-3">
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-600">
                                    <span className="text-gray-600 dark:text-slate-400">Accommodation</span>
                                    <span className="font-medium dark:text-white">₹{itinerary.totalCost.accommodation}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-600">
                                    <span className="text-gray-600 dark:text-slate-400">Food & Dining</span>
                                    <span className="font-medium dark:text-white">₹{itinerary.totalCost.food}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-600">
                                    <span className="text-gray-600 dark:text-slate-400">Transport</span>
                                    <span className="font-medium dark:text-white">₹{itinerary.totalCost.transport}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-600">
                                    <span className="text-gray-600 dark:text-slate-400">Activities</span>
                                    <span className="font-medium dark:text-white">₹{itinerary.totalCost.activities}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-slate-600">
                                    <span className="text-gray-600 dark:text-slate-400">Other</span>
                                    <span className="font-medium dark:text-white">₹{itinerary.totalCost.other}</span>
                                </div>
                                <div className="flex justify-between py-3 bg-orange-50 dark:bg-orange-900/20 -mx-2 px-2 rounded-lg mt-2">
                                    <span className="font-semibold text-dark-900 dark:text-white">Total</span>
                                    <span className="font-bold text-orange-600 text-lg">₹{itinerary.totalCost.grand}</span>
                                </div>
                            </div>
                        )}

                        {/* Budget Comparison */}
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700 rounded-xl">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600 dark:text-slate-400">Budget</span>
                                <span className="font-medium dark:text-white">₹{trip.totalBudget || trip.estimatedBudget || 0}</span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full ${(itinerary?.totalCost.grand || 0) > (trip.totalBudget || trip.estimatedBudget || 0) ? 'bg-red-500' : 'bg-emerald-500'
                                        }`}
                                    style={{ width: `${Math.min(100, ((itinerary?.totalCost.grand || 0) / (trip.totalBudget || trip.estimatedBudget || 1)) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                                {(itinerary?.totalCost.grand || 0) > (trip.totalBudget || trip.estimatedBudget || 0)
                                    ? `₹${(itinerary?.totalCost.grand || 0) - (trip.totalBudget || trip.estimatedBudget || 0)} over budget`
                                    : `₹${(trip.totalBudget || trip.estimatedBudget || 0) - (itinerary?.totalCost.grand || 0)} remaining`
                                }
                            </p>
                        </div>
                    </div>

                    {/* Cities Overview */}
                    <div className="card p-6">
                        <h3 className="text-lg font-semibold text-dark-900 dark:text-white mb-4">Destinations</h3>
                        <div className="space-y-3">
                            {trip.cities && trip.cities.length > 0 ? (
                                trip.cities.map(cityId => {
                                    const city = getCityData(cityId)
                                    if (!city) return null
                                    return (
                                        <div key={cityId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                            <img src={city.image} alt={city.name} className="w-12 h-12 rounded-lg object-cover" />
                                            <div className="flex-1">
                                                <p className="font-medium text-dark-900 dark:text-white">{city.name}</p>
                                                <p className="text-sm text-gray-500 dark:text-slate-400">{city.country}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-400 dark:text-slate-500" />
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="text-center py-4">
                                    <p className="text-gray-500 dark:text-slate-400 text-sm mb-2">No destinations added yet</p>
                                    <Link to={`/trips/${id}/edit`} className="text-orange-500 hover:underline text-sm font-medium">
                                        + Add destinations
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
