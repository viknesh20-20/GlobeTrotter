import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Save, Calendar, DollarSign, GripVertical, ChevronUp, ChevronDown, X, Plus, Loader2, ArrowLeft } from 'lucide-react'
import { useData } from '../context/DataContext'
import citiesData from '../data/cities.json'
import activitiesData from '../data/activities.json'
import tripsData from '../data/trips.json'

interface Section {
    id: string
    cityId: string
    dateRange: { start: string; end: string }
    budget: number
    activities: string[]
    isExpanded: boolean
}

interface TripData {
    id: string
    name: string
    startDate: string
    endDate: string
    cities: string[]
    activities?: string[]
    description?: string
}

export default function ItineraryBuilder() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { trips, loadTrips } = useData()
    const [trip, setTrip] = useState<TripData | null>(null)

    // Load trips from DataContext
    useEffect(() => {
        loadTrips()
    }, [])

    // Load trip data
    useEffect(() => {
        // First check DataContext trips (from API or mock)
        const apiTrip = trips.find(t => String(t.id) === id)
        if (apiTrip) {
            setTrip({
                id: String(apiTrip.id),
                name: apiTrip.name,
                startDate: apiTrip.startDate || apiTrip.start_date,
                endDate: apiTrip.endDate || apiTrip.end_date,
                cities: apiTrip.cities || [],
                activities: apiTrip.activities || [],
                description: apiTrip.description
            })
            return
        }

        // Then check JSON data
        const jsonTrip = tripsData.trips.find(t => t.id === id)
        if (jsonTrip) {
            setTrip(jsonTrip)
            return
        }

        // Finally check localStorage
        const storedTrips = JSON.parse(localStorage.getItem('globetrotter-trips') || '[]')
        const storedTrip = storedTrips.find((t: TripData) => t.id === id)
        if (storedTrip) {
            setTrip(storedTrip)
        }
    }, [id, trips])

    // Following Screen 5: Sections with Date Range and Budget
    // Following Screen 5: Sections with Date Range and Budget
    const [sections, setSections] = useState<Section[]>([])

    // Populate sections from trip data
    useEffect(() => {
        if (!trip || sections.length > 0) return

        // Check if there's an existing itinerary in localStorage
        const storedItineraries = JSON.parse(localStorage.getItem('globetrotter-itineraries') || '[]')
        const existingItinerary = storedItineraries.find((i: any) => i.tripId === id)

        if (existingItinerary) {
            const loadedSections = existingItinerary.stops.map((stop: any, index: number) => ({
                id: `section-${Date.now()}-${index}`,
                cityId: stop.cityId,
                dateRange: {
                    start: stop.days[0].date,
                    end: stop.days[stop.days.length - 1].date
                },
                budget: stop.days.reduce((acc: number, day: any) => acc + day.activities.reduce((dAcc: number, act: any) => dAcc + act.cost, 0), 0) + 500, // Approximate budget from acts + base
                activities: stop.days.flatMap((d: any) => d.activities.map((a: any) => a.activityId)),
                isExpanded: index === 0,
            }))
            setSections(loadedSections)
            return
        }

        // Otherwise generate sections from trip cities
        const start = new Date(trip.startDate)
        const end = new Date(trip.endDate)
        const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
        const daysPerCity = Math.floor(dayCount / (trip.cities.length || 1))

        const newSections = trip.cities.map((cityId, index) => {
            const sectionStart = new Date(start)
            sectionStart.setDate(start.getDate() + (index * daysPerCity))
            const sectionEnd = new Date(sectionStart)
            sectionEnd.setDate(sectionStart.getDate() + daysPerCity - 1)

            // Ensure last section goes to end date
            if (index === trip.cities.length - 1) {
                sectionEnd.setTime(end.getTime())
            }

            return {
                id: `section-${index}`,
                cityId,
                dateRange: {
                    start: sectionStart.toISOString().split('T')[0],
                    end: sectionEnd.toISOString().split('T')[0]
                },
                budget: 1000, // Default budget
                activities: [], // Could pre-fill from trip.activities if we wanted
                isExpanded: index === 0,
            }
        })
        setSections(newSections)

    }, [trip, id])

    const [isSaving, setIsSaving] = useState(false)

    const getCityData = (cityId: string) => citiesData.cities.find(c => c.id === cityId)
    const getActivityData = (actId: string) => activitiesData.activities.find(a => a.id === actId)

    const addSection = () => {
        const newSection: Section = {
            id: `section-${Date.now()}`,
            cityId: '',
            dateRange: { start: '', end: '' },
            budget: 0,
            activities: [],
            isExpanded: true,
        }
        setSections(prev => [...prev, newSection])
    }

    const removeSection = (sectionId: string) => {
        setSections(prev => prev.filter(s => s.id !== sectionId))
    }

    const updateSection = (sectionId: string, updates: Partial<Section>) => {
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, ...updates } : s))
    }

    const toggleSection = (sectionId: string) => {
        setSections(prev => prev.map(s => s.id === sectionId ? { ...s, isExpanded: !s.isExpanded } : s))
    }

    const handleSave = async () => {
        setIsSaving(true)

        // Construct itinerary object
        const stops = sections.map((section) => {
            const start = new Date(section.dateRange.start)
            const end = new Date(section.dateRange.end)
            const dayCount = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)

            const days = []
            for (let i = 0; i < dayCount; i++) {
                const date = new Date(start)
                date.setDate(start.getDate() + i)

                // Distribute activities (simple logic: all on day 1 for now, or spread? All on day 1 is safer to ensure they appear)
                // Better: if it's the first day, add all activities? No, that's crowded.
                // Let's just put all activities on the first day for simplicity in this MVP builder
                const dayActivities = i === 0 ? section.activities.map(actId => {
                    const actData = getActivityData(actId)
                    return {
                        activityId: actId,
                        startTime: "10:00 AM",
                        endTime: "12:00 PM",
                        cost: actData?.cost || 0,
                        notes: "Planned via Itinerary Builder"
                    }
                }) : []

                days.push({
                    dayNumber: i + 1, // This is relative to the stop, effectively. Use global day index in real app
                    date: date.toISOString().split('T')[0],
                    activities: dayActivities
                })
            }

            return {
                cityId: section.cityId,
                days
            }
        })

        // Calculate total cost
        const grandTotal = stops.reduce((acc, stop) => {
            return acc + stop.days.reduce((dAcc, day) => dAcc + day.activities.reduce((aAcc, act) => aAcc + act.cost, 0), 0)
        }, 0)

        const newItinerary = {
            tripId: id,
            totalCost: {
                accommodation: 0,
                food: 0,
                transport: 0,
                activities: grandTotal,
                other: 0,
                grand: grandTotal
            },
            stops
        }

        // Save to localStorage
        const storedItineraries = JSON.parse(localStorage.getItem('globetrotter-itineraries') || '[]')
        const otherItineraries = storedItineraries.filter((i: any) => i.tripId !== id)
        localStorage.setItem('globetrotter-itineraries', JSON.stringify([...otherItineraries, newItinerary]))

        await new Promise(resolve => setTimeout(resolve, 500))
        setIsSaving(false)
        navigate(`/trips/${id}`)
    }

    const totalBudget = sections.reduce((sum, s) => sum + s.budget, 0)

    if (!trip) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <p className="text-gray-500 dark:text-slate-400">Trip not found</p>
                <Link to="/trips" className="btn-primary mt-4">Back to My Trips</Link>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link to={`/trips/${id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
                        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-slate-400" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900 dark:text-white">Edit: {trip.name}</h1>
                        <p className="text-gray-500 dark:text-slate-400">Add stops and activities to your trip</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-slate-400">Total Budget</p>
                        <p className="text-xl font-bold text-orange-600">₹{totalBudget.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="btn-primary"
                    >
                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Itinerary
                    </button>
                </div>
            </div>

            {/* Sections - Following Screen 5 structure */}
            <div className="space-y-4">
                {sections.map((section, index) => {
                    const city = getCityData(section.cityId)
                    const sectionActivities = section.activities.map(id => getActivityData(id)).filter(Boolean)

                    return (
                        <div key={section.id} className="card overflow-hidden">
                            {/* Section Header */}
                            <div
                                className="p-4 bg-gray-50 border-b border-gray-100 flex items-center gap-4 cursor-pointer"
                                onClick={() => toggleSection(section.id)}
                            >
                                <div className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center font-bold">
                                    {index + 1}
                                </div>

                                <div className="flex-1">
                                    <p className="text-sm text-gray-500">
                                        This can be any information about this section.
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        This can be anything like hours worked, hotel or any other activity
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    {section.isExpanded ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeSection(section.id); }}
                                        className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Section Content - Following wireframe: Date Range, xxx to xxx, Budget of this section */}
                            {section.isExpanded && (
                                <div className="p-4 space-y-4">
                                    {/* City Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                            Select Destination
                                        </label>
                                        <select
                                            value={section.cityId}
                                            onChange={e => updateSection(section.id, { cityId: e.target.value })}
                                            className="input"
                                        >
                                            <option value="">Choose a city...</option>
                                            {citiesData.cities.map(city => (
                                                <option key={city.id} value={city.id}>{city.name}, {city.country}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date Range - Following Screen 5: "Date Range: xxx to xxx" */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                                <Calendar className="inline w-4 h-4 mr-1" />
                                                Date Range: From
                                            </label>
                                            <input
                                                type="date"
                                                value={section.dateRange.start}
                                                onChange={e => updateSection(section.id, {
                                                    dateRange: { ...section.dateRange, start: e.target.value }
                                                })}
                                                className="input"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                                To
                                            </label>
                                            <input
                                                type="date"
                                                value={section.dateRange.end}
                                                onChange={e => updateSection(section.id, {
                                                    dateRange: { ...section.dateRange, end: e.target.value }
                                                })}
                                                min={section.dateRange.start}
                                                className="input"
                                            />
                                        </div>
                                    </div>

                                    {/* Budget of this section - Following Screen 5 */}
                                    <div>
                                        <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                            <DollarSign className="inline w-4 h-4 mr-1" />
                                            Budget of this section
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                            <input
                                                type="number"
                                                value={section.budget}
                                                onChange={e => updateSection(section.id, { budget: parseInt(e.target.value) || 0 })}
                                                className="input pl-8"
                                                min={0}
                                            />
                                        </div>
                                    </div>

                                    {/* Activities */}
                                    <div>
                                        <label className="block text-sm font-medium text-dark-700 mb-1.5">
                                            Activities
                                        </label>
                                        {city && (
                                            <div className="space-y-2">
                                                {sectionActivities.map(activity => activity && (
                                                    <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                                        <img src={activity.image} alt={activity.name} className="w-12 h-12 rounded-lg object-cover" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-dark-900">{activity.name}</p>
                                                            <p className="text-sm text-gray-500">{activity.duration}h • ₹{activity.cost}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => updateSection(section.id, {
                                                                activities: section.activities.filter(id => id !== activity.id)
                                                            })}
                                                            className="p-1 hover:bg-gray-200 rounded"
                                                        >
                                                            <X className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    </div>
                                                ))}

                                                {/* Add Activity */}
                                                <select
                                                    onChange={e => {
                                                        if (e.target.value && !section.activities.includes(e.target.value)) {
                                                            updateSection(section.id, {
                                                                activities: [...section.activities, e.target.value]
                                                            })
                                                        }
                                                        e.target.value = ''
                                                    }}
                                                    className="input"
                                                    defaultValue=""
                                                >
                                                    <option value="">+ Add an activity...</option>
                                                    {activitiesData.activities
                                                        .filter(a => a.cityId === section.cityId && !section.activities.includes(a.id))
                                                        .map(activity => (
                                                            <option key={activity.id} value={activity.id}>
                                                                {activity.name} (₹{activity.cost})
                                                            </option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                        )}
                                        {!city && (
                                            <p className="text-sm text-gray-500 italic">Select a city first to add activities</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            {/* Add Another Section Button - Following Screen 5: "+ Add another Section" */}
            <button
                onClick={addSection}
                className="w-full mt-4 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-primary-400 hover:text-primary-600 transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add another Section
            </button>
        </div>
    )
}
