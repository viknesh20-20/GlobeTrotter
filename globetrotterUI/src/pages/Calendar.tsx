import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, MapPin, Plus, Calendar as CalendarIcon, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useData } from '../context/DataContext'
import citiesData from '../data/cities.json'

interface StoredTrip {
    id: string
    userId?: string
    user_id?: string
    name: string
    coverImage?: string
    cover_image?: string
    startDate?: string
    start_date?: string
    endDate?: string
    end_date?: string
    cities: string[]
    status?: string
    description?: string
}

export default function Calendar() {
    const { trips, loadTrips } = useData()
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [allTrips, setAllTrips] = useState<StoredTrip[]>([])

    // Load trips from DataContext and localStorage
    useEffect(() => {
        loadTrips()
    }, [])

    useEffect(() => {
        // Normalize trips from DataContext (handles both API and mock data)
        const normalizedTrips = trips.map((t: any) => ({
            ...t,
            id: String(t.id),
            userId: t.userId || t.user_id,
            startDate: t.startDate || t.start_date,
            endDate: t.endDate || t.end_date,
            coverImage: t.coverImage || t.cover_image
        }))

        // Also get localStorage trips
        const storedTrips = JSON.parse(localStorage.getItem('globetrotter-trips') || '[]')

        // Combine and deduplicate by ID
        const combined = [...normalizedTrips, ...storedTrips]
        const uniqueTrips = combined.reduce((acc: StoredTrip[], trip: StoredTrip) => {
            if (!acc.find(t => t.id === trip.id)) {
                acc.push(trip)
            }
            return acc
        }, [])

        setAllTrips(uniqueTrips)
    }, [trips])

    const getCityData = (cityId: string) => citiesData.cities.find(c => c.id === cityId)

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const monthName = currentDate.toLocaleString('default', { month: 'long' })

    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
    const goToToday = () => {
        setCurrentDate(new Date())
        setSelectedDate(new Date())
    }

    const getTripsForDate = (day: number) => {
        const date = new Date(year, month, day).toISOString().split('T')[0]
        return allTrips.filter(trip => {
            const start = trip.startDate || ''
            const end = trip.endDate || ''
            return start && end && date >= start && date <= end
        })
    }

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    const selectedDateTrips = selectedDate
        ? getTripsForDate(selectedDate.getDate())
        : []

    // Color palette for trips - warm travel theme
    const tripColors = [
        { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-100 dark:bg-orange-900/30' },
        { bg: 'bg-rose-500', text: 'text-rose-500', light: 'bg-rose-100 dark:bg-rose-900/30' },
        { bg: 'bg-teal-500', text: 'text-teal-500', light: 'bg-teal-100 dark:bg-teal-900/30' },
        { bg: 'bg-purple-500', text: 'text-purple-500', light: 'bg-purple-100 dark:bg-purple-900/30' },
        { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-100 dark:bg-blue-900/30' },
    ]

    const getTripColor = (index: number) => tripColors[index % tripColors.length]

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-rose-500 rounded-xl shadow-lg">
                        <CalendarIcon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Calendar</h1>
                        <p className="text-sm text-gray-500 dark:text-slate-400">Manage your travel schedule</p>
                    </div>
                </div>
                <Link
                    to="/trips/new"
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-rose-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Plan New Trip
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Calendar */}
                <div className="lg:col-span-3">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
                        {/* Calendar Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-slate-900">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={goToToday}
                                        className="px-4 py-2 text-sm font-semibold text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                                    >
                                        Today
                                    </button>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={prevMonth}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                                        </button>
                                        <button
                                            onClick={nextMonth}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                        >
                                            <ChevronRight className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                                        </button>
                                    </div>
                                    <h2 className="text-xl font-semibold text-dark-900 dark:text-white">
                                        {monthName} {year}
                                    </h2>
                                </div>
                            </div>
                        </div>

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 border-b border-gray-100 dark:border-slate-700">
                            {days.map(day => (
                                <div key={day} className="py-3 text-center text-xs font-semibold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7">
                            {/* Empty cells */}
                            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                                <div key={`empty-${i}`} className="min-h-[100px] p-2 bg-gray-50/50 dark:bg-slate-900/30 border-b border-r border-gray-100 dark:border-slate-700/50" />
                            ))}

                            {/* Days */}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1
                                const tripsOnDay = getTripsForDate(day)
                                const dateObj = new Date(year, month, day)
                                const isToday = new Date().toDateString() === dateObj.toDateString()
                                const isSelected = selectedDate?.toDateString() === dateObj.toDateString()
                                const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6

                                return (
                                    <motion.div
                                        key={day}
                                        onClick={() => setSelectedDate(dateObj)}
                                        whileHover={{ backgroundColor: 'rgba(249, 115, 22, 0.05)' }}
                                        className={`
                                            min-h-[100px] p-2 border-b border-r border-gray-100 dark:border-slate-700/50 cursor-pointer transition-all
                                            ${isWeekend ? 'bg-gray-50/50 dark:bg-slate-900/20' : 'bg-white dark:bg-slate-800'}
                                            ${isSelected ? 'ring-2 ring-orange-500 ring-inset' : ''}
                                        `}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span
                                                className={`
                                                    w-7 h-7 flex items-center justify-center rounded-full text-sm font-medium transition-colors
                                                    ${isToday
                                                        ? 'bg-orange-500 text-white'
                                                        : isSelected
                                                            ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                                                    }
                                                `}
                                            >
                                                {day}
                                            </span>
                                        </div>

                                        <div className="space-y-1">
                                            {tripsOnDay.slice(0, 2).map((trip, idx) => (
                                                <Link
                                                    key={trip.id}
                                                    to={`/trips/${trip.id}`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className={`
                                                        block text-xs px-2 py-1 rounded-md text-white truncate font-medium
                                                        ${getTripColor(idx).bg}
                                                        hover:opacity-90 transition-opacity shadow-sm
                                                    `}
                                                    title={trip.name}
                                                >
                                                    {trip.name}
                                                </Link>
                                            ))}
                                            {tripsOnDay.length > 2 && (
                                                <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
                                                    +{tripsOnDay.length - 2} more
                                                </span>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Trip Legend */}
                    {allTrips.length > 0 && (
                        <div className="mt-4 bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
                            <h3 className="font-semibold text-dark-900 dark:text-white mb-3">Your Trips</h3>
                            <div className="flex flex-wrap gap-3">
                                {allTrips.map((trip, idx) => (
                                    <Link
                                        key={trip.id}
                                        to={`/trips/${trip.id}`}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <div className={`w-3 h-3 rounded-full ${getTripColor(idx).bg}`} />
                                        <span className="text-sm text-dark-800 dark:text-slate-200">{trip.name}</span>
                                        <span className="text-xs text-gray-500 dark:text-slate-400">
                                            {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Selected Date Details */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <div className="text-center mb-4">
                            <p className="text-4xl font-bold text-dark-900 dark:text-white">
                                {selectedDate?.getDate() || new Date().getDate()}
                            </p>
                            <p className="text-gray-500 dark:text-slate-400">
                                {(selectedDate || new Date()).toLocaleDateString('en-US', { weekday: 'long', month: 'long' })}
                            </p>
                        </div>

                        {selectedDateTrips.length > 0 ? (
                            <div className="space-y-3">
                                <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Trips on this day</p>
                                {selectedDateTrips.map((trip, idx) => {
                                    const cities = trip.cities.map(id => getCityData(id)?.name).filter(Boolean).join(', ')
                                    return (
                                        <Link
                                            key={trip.id}
                                            to={`/trips/${trip.id}`}
                                            className="block p-3 rounded-xl bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className={`w-2 h-full min-h-[40px] rounded-full ${getTripColor(idx).bg}`} />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-dark-900 dark:text-white truncate">{trip.name}</p>
                                                    {cities && (
                                                        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                                                            <MapPin className="w-3 h-3" />
                                                            {cities}
                                                        </p>
                                                    )}
                                                </div>
                                                <Eye className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-gray-500 dark:text-slate-400 text-sm mb-3">No trips on this day</p>
                                <Link to="/trips/new" className="text-orange-600 dark:text-orange-400 text-sm font-medium hover:underline">
                                    + Plan a trip
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Upcoming Trips */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-slate-700">
                        <h3 className="font-semibold text-dark-900 dark:text-white mb-4">Upcoming Trips</h3>
                        {allTrips.filter(t => t.startDate && new Date(t.startDate) >= new Date()).length > 0 ? (
                            <div className="space-y-3">
                                {allTrips
                                    .filter(t => t.startDate && new Date(t.startDate) >= new Date())
                                    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime())
                                    .slice(0, 3)
                                    .map((trip, idx) => (
                                        <Link
                                            key={trip.id}
                                            to={`/trips/${trip.id}`}
                                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${getTripColor(idx).light} flex items-center justify-center`}>
                                                <CalendarIcon className={`w-5 h-5 ${getTripColor(idx).text}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-dark-900 dark:text-white truncate">{trip.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-slate-400">
                                                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No date'}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-slate-400 text-sm text-center py-4">No upcoming trips</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
