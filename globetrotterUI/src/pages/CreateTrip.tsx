
import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, DollarSign, Clock, Check, ChevronRight, ChevronLeft, Plus, X, Loader2, AlertCircle, Sparkles, FileText, Image as ImageIcon } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'

interface TripData {
    id: string
    userId: string
    name: string
    coverImage: string
    startDate: string
    endDate: string
    description: string
    cities: string[]
    activities: string[]
    status: 'upcoming' | 'ongoing' | 'completed'
    estimatedBudget: number
    createdAt: string
}

export default function CreateTrip() {
    const navigate = useNavigate()
    const { user } = useAuth()
    const { cities, activities, loadCities, loadActivities, createTrip } = useData()

    useEffect(() => {
        loadCities()
        loadActivities()
    }, [])

    const [currentStep, setCurrentStep] = useState(1)
    const totalSteps = 4

    // City dates state
    const [cityDates, setCityDates] = useState<Record<string, { start: string, end: string }>>({})

    // Form state
    const [formData, setFormData] = useState({
        tripName: '',
        coverImage: '',
        startDate: '',
        endDate: '',
        description: '',
    })

    const [selectedCities, setSelectedCities] = useState<string[]>([])
    const [selectedActivities, setSelectedActivities] = useState<string[]>([])
    const [citySearch, setCitySearch] = useState('')
    const [showCitySuggestions, setShowCitySuggestions] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Cover photo options
    const coverPhotos = [
        'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600',
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600',
        'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?w=600',
        'https://images.unsplash.com/photo-1527631746610-bca00a040d60?w=600',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',
        'https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=600',
    ]

    // City suggestions
    const suggestedCities = cities.filter(city =>
        city.name.toLowerCase().includes(citySearch.toLowerCase()) ||
        city.country.toLowerCase().includes(citySearch.toLowerCase())
    ).slice(0, 6)

    // Activities for selected cities
    const availableActivities = activities.filter(
        a => selectedCities.includes(String(a.cityId || a.city_id))
    )

    // Helper functions
    const getCityData = (cityId: string) => cities.find(c => String(c.id) === cityId)
    const getActivityData = (actId: string) => activities.find(a => String(a.id) === actId)

    // Helper to get city image (handles different field names from API and mock data)
    const getCityImage = (city: any): string => {
        return city?.image || city?.imageUrl || city?.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
    }

    // Helper to get activity cost (handles different field names from API and mock data)
    const getActivityCost = (activity: any): number => {
        return activity?.cost ?? activity?.estimatedCost ?? activity?.estimated_cost ?? 0
    }

    // Budget calculation
    const calculateBudget = () => {
        let total = 0

        // City daily costs
        const days = formData.startDate && formData.endDate
            ? Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1
            : 0

        selectedCities.forEach(cityId => {
            const city = getCityData(cityId)
            if (city) {
                const dailyBudget = city.averageDailyBudget || city.average_daily_budget || 3000
                total += dailyBudget * Math.ceil(days / selectedCities.length)
            }
        })

        // Activity costs
        selectedActivities.forEach(actId => {
            const activity = getActivityData(actId)
            if (activity) {
                total += getActivityCost(activity)
            }
        })

        return total
    }

    const checkOverlap = (cityId: string, start: string, end: string) => {
        const startDate = new Date(start)
        const endDate = new Date(end)

        for (const otherCityId of selectedCities) {
            if (otherCityId === cityId) continue

            const otherDates = cityDates[otherCityId]
            if (!otherDates?.start || !otherDates?.end) continue

            const otherStart = new Date(otherDates.start)
            const otherEnd = new Date(otherDates.end)

            // Check overlap: (StartA <= EndB) and (EndA >= StartB)
            if (startDate <= otherEnd && endDate >= otherStart) {
                const otherCityName = getCityData(otherCityId)?.name || 'another city';
                return `Dates overlap with ${otherCityName} (${otherDates.start} - ${otherDates.end})`;
            }
        }
        return null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleAddCity = (cityId: string) => {
        if (!selectedCities.includes(cityId)) {
            setSelectedCities(prev => [...prev, cityId])
        }
        setCitySearch('')
        setShowCitySuggestions(false)
    }

    const handleRemoveCity = (cityId: string) => {
        setSelectedCities(prev => prev.filter(id => id !== cityId))
        // Remove activities from removed city
        setSelectedActivities(prev => prev.filter(actId => {
            const act = activities.find(a => String(a.id) === actId)
            return act && String(act.cityId || act.city_id) !== cityId
        }))
    }

    const toggleActivity = (activityId: string) => {
        setSelectedActivities(prev =>
            prev.includes(activityId)
                ? prev.filter(id => id !== activityId)
                : [...prev, activityId]
        )
    }

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {}

        if (step === 1) {
            if (!formData.tripName.trim()) newErrors.tripName = 'Trip name is required'
            if (!formData.startDate) newErrors.startDate = 'Start date is required'
            if (!formData.endDate) newErrors.endDate = 'End date is required'
            if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
                newErrors.endDate = 'End date must be after start date'
            }
        }

        if (step === 3) {
            // Validate city dates
            selectedCities.forEach(cityId => {
                const dates = cityDates[cityId]
                if (!dates?.start || !dates?.end) {
                    newErrors[`cityDate_${cityId} `] = 'Please select arrival and departure dates'
                    return
                }

                if (dates.start > dates.end) {
                    newErrors[`cityDate_${cityId} `] = 'Departure must be after arrival'
                    return
                }

                // Check if dates are within trip range
                if (dates.start < formData.startDate || dates.end > formData.endDate) {
                    newErrors[`cityDate_${cityId} `] = 'Dates must be within the overall trip duration'
                    return
                }

                // Check for overlaps
                const overlapError = checkOverlap(cityId, dates.start, dates.end)
                if (overlapError) {
                    newErrors[`cityDate_${cityId} `] = overlapError
                }
            })
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, totalSteps))
        }
    }

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1))
    }

    const handleCreateTrip = async () => {
        if (!validateStep(currentStep)) return

        setIsLoading(true)

        // Generate itinerary data first (used by both API and localStorage paths)
        const generateItinerary = (tripId: string) => {
            const stops = selectedCities.map(cityId => {
                const dates = cityDates[cityId]
                const start = dates ? new Date(dates.start) : new Date(formData.startDate)
                const end = dates ? new Date(dates.end) : new Date(formData.endDate)

                const dayCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
                const days = []

                for (let i = 0; i < dayCount; i++) {
                    const date = new Date(start)
                    date.setDate(start.getDate() + i)

                    const cityActs = selectedActivities.filter(actId => {
                        const act = getActivityData(actId)
                        return String(act?.cityId || act?.city_id) === cityId
                    })

                    const dayActivities = cityActs
                        .filter((_, idx) => idx % dayCount === i)
                        .map(actId => {
                            const actData = getActivityData(actId)
                            return {
                                id: `item-${Date.now()}-${actId}`,
                                type: 'activity',
                                activityId: actId,
                                startTime: "10:00 AM",
                                endTime: "12:00 PM",
                                cost: getActivityCost(actData),
                                notes: "Planned during creation"
                            }
                        })

                    days.push({
                        dayNumber: -1,
                        date: date.toISOString().split('T')[0],
                        activities: dayActivities
                    })
                }
                return { cityId, days }
            })

            // Re-index days globally
            const tripStart = new Date(formData.startDate)
            stops.forEach(stop => {
                stop.days.forEach(day => {
                    const dayDate = new Date(day.date)
                    const diffTime = Math.abs(dayDate.getTime() - tripStart.getTime())
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
                    day.dayNumber = diffDays
                })
            })

            return {
                tripId,
                totalCost: {
                    accommodation: 0,
                    food: 0,
                    transport: 0,
                    activities: calculateBudget(),
                    other: 0,
                    grand: calculateBudget()
                },
                stops
            }
        }

        const newTripData = {
            name: formData.tripName,
            coverImage: formData.coverImage || coverPhotos[0],
            startDate: formData.startDate,
            endDate: formData.endDate,
            description: formData.description,
            cities: selectedCities,
            activities: selectedActivities,
            estimatedBudget: calculateBudget(),
        }

        try {
            // Try to create via API first
            const result = await createTrip(newTripData)
            if (result) {
                // Even with API success, save itinerary to localStorage for now
                // (until API has itinerary endpoints)
                const itinerary = generateItinerary(result.id || `trip-${Date.now()}`)
                const existingItineraries = JSON.parse(localStorage.getItem('globetrotter-itineraries') || '[]')
                localStorage.setItem('globetrotter-itineraries', JSON.stringify([...existingItineraries, itinerary]))

                setIsLoading(false)
                navigate('/trips')
                return
            }
        } catch {
            // Fall back to localStorage if API fails
            console.log('API failed, falling back to localStorage')
        }

        // Fallback: save to localStorage
        const newTrip: TripData = {
            id: `trip-${Date.now()}`,
            userId: user?.id || 'unknown',
            name: formData.tripName,
            coverImage: formData.coverImage || coverPhotos[0],
            startDate: formData.startDate,
            endDate: formData.endDate,
            description: formData.description,
            cities: selectedCities,
            activities: selectedActivities,
            status: new Date(formData.startDate) > new Date() ? 'upcoming' : 'ongoing',
            estimatedBudget: calculateBudget(),
            createdAt: new Date().toISOString(),
        }

        // Use shared helper to generate itinerary
        const newItinerary = generateItinerary(newTrip.id)

        // Save to localStorage
        const existingTrips = JSON.parse(localStorage.getItem('globetrotter-trips') || '[]')
        localStorage.setItem('globetrotter-trips', JSON.stringify([...existingTrips, newTrip]))

        const existingItineraries = JSON.parse(localStorage.getItem('globetrotter-itineraries') || '[]')
        localStorage.setItem('globetrotter-itineraries', JSON.stringify([...existingItineraries, newItinerary]))

        setIsLoading(false)
        navigate('/trips')
    }

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault()
        // Determine action based on step
        if (currentStep < totalSteps) {
            nextStep()
        } else {
            // This branch should ideally not be hit if the button type is 'button' and onClick is used,
            // but it's a safe fallback if the form is submitted by pressing Enter on an input field.
            handleCreateTrip()
        }
    }

    const stepVariants = {
        enter: { x: 50, opacity: 0 },
        center: { x: 0, opacity: 1 },
        exit: { x: -50, opacity: 0 }
    }

    return (
        <div className="max-w-4xl mx-auto animate-fade-in pb-10">
            {/* Progress Steps */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    {[1, 2, 3, 4].map((step) => (
                        <div key={step} className="flex items-center flex-1 last:flex-none">
                            <div className={`
                                w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all flex-shrink-0
                                ${currentStep >= step
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                                }
                            `}>
                                {currentStep > step ? <Check className="w-5 h-5" /> : step}
                            </div>
                            {step < totalSteps && (
                                <div className={`flex-1 h-1 mx-1 rounded ${currentStep > step ? 'bg-orange-500' : 'bg-gray-200 dark:bg-slate-700'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>
                <div className="flex justify-between text-sm text-gray-500 dark:text-slate-400">
                    <span>Trip Details</span>
                    <span>Destinations</span>
                    <span>Plan Schedule</span>
                    <span>Review</span>
                </div>
            </div>

            <div className="card p-6 md:p-8 dark:bg-slate-800">
                <form onSubmit={handleSubmit}>
                    <AnimatePresence mode="wait">
                        {/* Step 1: Basic Details */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-1">Trip Details</h2>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm">Let's start with the basics</p>
                                </div>

                                {/* Trip Name */}
                                <div>
                                    <label htmlFor="tripName" className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1.5">
                                        Trip Name *
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            id="tripName"
                                            name="tripName"
                                            type="text"
                                            value={formData.tripName}
                                            onChange={handleChange}
                                            placeholder="e.g., European Summer Adventure"
                                            className={`input pl-10 ${errors.tripName ? 'input-error' : ''}`}
                                        />
                                    </div>
                                    {errors.tripName && <p className="text-red-500 text-xs mt-1">{errors.tripName}</p>}
                                </div>

                                {/* Cover Photo */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" />
                                        Cover Photo
                                    </label>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                                        {coverPhotos.map((photo, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, coverImage: photo }))}
                                                className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${formData.coverImage === photo
                                                    ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900/50'
                                                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                <img src={photo} alt={`Cover ${index + 1}`} className="w-full h-full object-cover" />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="startDate" className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1.5">
                                            Start Date *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                id="startDate"
                                                name="startDate"
                                                type="date"
                                                value={formData.startDate}
                                                onChange={handleChange}
                                                className={`input pl-10 ${errors.startDate ? 'input-error' : ''}`}
                                            />
                                        </div>
                                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="endDate" className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1.5">
                                            End Date *
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                id="endDate"
                                                name="endDate"
                                                type="date"
                                                value={formData.endDate}
                                                onChange={handleChange}
                                                min={formData.startDate}
                                                className={`input pl-10 ${errors.endDate ? 'input-error' : ''}`}
                                            />
                                        </div>
                                        {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1.5">
                                        Description (Optional)
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                        <textarea
                                            id="description"
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Describe your trip..."
                                            rows={3}
                                            className="input pl-10 resize-none"
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 2: Destinations & Activities */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-1">Destinations & Activities</h2>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm">Add places you want to visit</p>
                                </div>

                                {/* City Search */}
                                <div>
                                    <label className="block text-sm font-medium text-dark-700 dark:text-slate-300 mb-1.5 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-orange-500" />
                                        Add Destinations
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={citySearch}
                                            onChange={e => {
                                                setCitySearch(e.target.value)
                                                setShowCitySuggestions(e.target.value.length > 0)
                                            }}
                                            onFocus={() => citySearch && setShowCitySuggestions(true)}
                                            placeholder="Search cities..."
                                            className="input"
                                        />

                                        {showCitySuggestions && suggestedCities.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 max-h-64 overflow-y-auto">
                                                {suggestedCities.map(city => (
                                                    <button
                                                        key={city.id}
                                                        type="button"
                                                        onClick={() => handleAddCity(city.id)}
                                                        disabled={selectedCities.includes(city.id)}
                                                        className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                                                    >
                                                        <img src={getCityImage(city)} alt={city.name} className="w-12 h-12 rounded-lg object-cover" />
                                                        <div className="flex-1">
                                                            <p className="font-medium text-dark-900 dark:text-white">{city.name}</p>
                                                            <p className="text-sm text-gray-500 dark:text-slate-400">{city.country}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-orange-600">₹{city.averageDailyBudget || city.average_daily_budget || 0}/day</p>
                                                            <p className="text-xs text-gray-400">avg cost</p>
                                                        </div>
                                                        <Plus className="w-5 h-5 text-orange-500" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Cities */}
                                {selectedCities.length > 0 && (
                                    <div className="space-y-3">
                                        <p className="text-sm font-medium text-dark-700 dark:text-slate-300">Selected Destinations ({selectedCities.length})</p>
                                        <div className="grid gap-3">
                                            {selectedCities.map(cityId => {
                                                const city = getCityData(cityId)
                                                if (!city) return null
                                                const cityActivities = availableActivities.filter(a => a.cityId === cityId)

                                                return (
                                                    <div key={cityId} className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl">
                                                        <div className="flex items-center gap-3 mb-3">
                                                            <img src={getCityImage(city)} alt={city.name} className="w-14 h-14 rounded-lg object-cover" />
                                                            <div className="flex-1">
                                                                <p className="font-semibold text-dark-900 dark:text-white">{city.name}</p>
                                                                <p className="text-sm text-gray-500 dark:text-slate-400">{city.country}</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveCity(cityId)}
                                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-500 transition-colors"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>

                                                        {cityActivities.length > 0 && (
                                                            <div>
                                                                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">
                                                                    Activities ({cityActivities.length} available):
                                                                </p>
                                                                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto scrollbar-hide">
                                                                    {cityActivities.map(act => (
                                                                        <button
                                                                            key={act.id}
                                                                            type="button"
                                                                            onClick={() => toggleActivity(act.id)}
                                                                            className={`px-3 py-1.5 rounded-lg text-sm transition-all flex items-center gap-1.5 ${selectedActivities.includes(act.id)
                                                                                ? 'bg-orange-500 text-white shadow-md'
                                                                                : 'bg-white dark:bg-slate-600 text-dark-700 dark:text-slate-200 border border-gray-200 dark:border-slate-500 hover:border-orange-400 hover:shadow-sm'
                                                                                }`}
                                                                        >
                                                                            <span>{act.name}</span>
                                                                            <span className="text-xs opacity-80">₹{getActivityCost(act)}</span>
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                                {selectedActivities.filter(id => cityActivities.some(a => a.id === id)).length > 0 && (
                                                                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                                                        {selectedActivities.filter(id => cityActivities.some(a => a.id === id)).length} selected for this city
                                                                    </p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Quick Add Popular */}
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">Popular destinations:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {cities.slice(0, 6).map((city: any) => (
                                            <button
                                                key={city.id}
                                                type="button"
                                                onClick={() => handleAddCity(String(city.id))}
                                                disabled={selectedCities.includes(String(city.id))}
                                                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${selectedCities.includes(String(city.id))
                                                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200'
                                                    : 'border-gray-200 dark:border-slate-600 text-dark-600 dark:text-slate-300 hover:border-orange-400 hover:text-orange-600'
                                                    }`}
                                            >
                                                {city.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Plan Schedule */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-1">Plan Itinerary</h2>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm">When will you visit each place? Dates must not overlap.</p>
                                </div>

                                <div className="space-y-4">
                                    {selectedCities.map((cityId, index) => {
                                        const city = getCityData(cityId)
                                        if (!city) return null

                                        // Sort cities by index for logical flow validation if needed, 
                                        // but here we just check against all others.
                                        const errorKey = `cityDate_${cityId}`
                                        const hasError = !!errors[errorKey]

                                        return (
                                            <div key={cityId} className={`p-4 border rounded-xl bg-white dark:bg-slate-800 transition-colors ${hasError
                                                ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                                : 'border-gray-200 dark:border-slate-700'
                                                }`}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="flex flex-col items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 text-sm font-bold text-gray-500">
                                                        {index + 1}
                                                    </div>
                                                    <img src={getCityImage(city)} alt={city.name} className="w-12 h-12 rounded-lg object-cover" />
                                                    <div>
                                                        <h3 className="font-semibold text-dark-900 dark:text-white">{city.name}</h3>
                                                        <p className="text-sm text-gray-500 dark:text-slate-400">
                                                            {index === 0 ? 'Start of trip' : `Next destination`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Arrival</label>
                                                        <input
                                                            type="date"
                                                            className={`input w-full ${hasError ? 'input-error' : ''}`}
                                                            min={formData.startDate}
                                                            max={formData.endDate}
                                                            value={cityDates[cityId]?.start || ''}
                                                            onChange={e => {
                                                                const newStart = e.target.value
                                                                setCityDates(prev => ({
                                                                    ...prev,
                                                                    [cityId]: { ...prev[cityId], start: newStart }
                                                                }))
                                                                // Auto-clear error on change
                                                                if (errors[errorKey]) {
                                                                    const newErrs = { ...errors }
                                                                    delete newErrs[errorKey]
                                                                    setErrors(newErrs)
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 dark:text-slate-400 mb-1">Departure</label>
                                                        <input
                                                            type="date"
                                                            className={`input w-full ${hasError ? 'input-error' : ''}`}
                                                            min={cityDates[cityId]?.start || formData.startDate}
                                                            max={formData.endDate}
                                                            value={cityDates[cityId]?.end || ''}
                                                            onChange={e => {
                                                                setCityDates(prev => ({
                                                                    ...prev,
                                                                    [cityId]: { ...prev[cityId], end: e.target.value }
                                                                }))
                                                                if (errors[errorKey]) {
                                                                    const newErrs = { ...errors }
                                                                    delete newErrs[errorKey]
                                                                    setErrors(newErrs)
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                {hasError && (
                                                    <div className="flex items-center gap-2 mt-3 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                                        <p>{errors[errorKey]}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                    {selectedCities.length === 0 && (
                                        <p className="text-center text-gray-500">No cities selected. Go back to add destinations.</p>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Review */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.3 }}
                                className="space-y-6"
                            >
                                <div>
                                    <h2 className="text-xl font-bold text-dark-900 dark:text-white mb-1">Review Your Trip</h2>
                                    <p className="text-gray-500 dark:text-slate-400 text-sm">Make sure everything looks good</p>
                                </div>

                                {/* Trip Preview Card */}
                                <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden">
                                    <div className="aspect-video relative">
                                        <img
                                            src={formData.coverImage || coverPhotos[0]}
                                            alt="Trip cover"
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-2xl font-bold text-white">{formData.tripName}</h3>
                                            <p className="text-white/80">{formData.description || 'No description'}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-4">
                                        {/* Dates */}
                                        <div className="flex items-center gap-4 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-slate-400">
                                                <Clock className="w-4 h-4" />
                                                {Math.ceil((new Date(formData.endDate).getTime() - new Date(formData.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                                            </div>
                                        </div>

                                        {/* Cities */}
                                        <div>
                                            <p className="text-sm font-medium text-dark-700 dark:text-slate-300 mb-2">Destinations</p>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedCities.map(cityId => {
                                                    const city = getCityData(cityId)
                                                    return city && (
                                                        <span key={cityId} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm">
                                                            {city.name}
                                                        </span>
                                                    )
                                                })}
                                                {selectedCities.length === 0 && (
                                                    <span className="text-gray-400 text-sm">No destinations selected</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Activities */}
                                        {selectedActivities.length > 0 && (
                                            <div>
                                                <p className="text-sm font-medium text-dark-700 dark:text-slate-300 mb-2">Activities ({selectedActivities.length})</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedActivities.map(actId => {
                                                        const act = getActivityData(actId)
                                                        return act && (
                                                            <span key={actId} className="px-3 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full text-sm">
                                                                {act.name}
                                                            </span>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {/* Budget */}
                                        <div className="p-4 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-900/20 dark:to-rose-900/20 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-5 h-5 text-orange-600" />
                                                    <span className="font-medium text-dark-900 dark:text-white">Estimated Budget</span>
                                                </div>
                                                <span className="text-2xl font-bold text-orange-600">₹{calculateBudget().toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <div className="flex gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-slate-700">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="btn-outline flex items-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}

                        <div className="flex-1" />

                        {currentStep < totalSteps ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="btn-primary flex items-center gap-2"
                            >
                                Continue
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        ) : (
                            <button
                                type="button" // CHANGED FROM submit TO button to prevent accidental form submissions
                                onClick={handleCreateTrip}
                                disabled={isLoading}
                                className="btn-primary flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        Create Trip
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    )
}
