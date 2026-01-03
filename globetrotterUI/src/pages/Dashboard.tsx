import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { PlusCircle, MapPin, Calendar, TrendingUp, ChevronRight, Star, Loader2 } from 'lucide-react'

export default function Dashboard() {
    useAuth()
    const { trips, cities, loadTrips, loadCities, isLoading } = useData()

    useEffect(() => {
        loadTrips()
        loadCities()
    }, [])

    // Filter trips by status
    const ongoingTrips = trips.filter(t => t.status === 'active' || t.status === 'ongoing')
    const upcomingTrips = trips.filter(t => t.status === 'upcoming')

    // Get city data for display
    const getCityData = (cityId: string) => cities.find(c => c.id === cityId)

    // Get first city from trip (handle both array of IDs and array of objects)
    const getFirstCity = (trip: any) => {
        if (trip.cities && trip.cities.length > 0) {
            const firstCity = trip.cities[0]
            if (typeof firstCity === 'string') {
                return getCityData(firstCity)
            }
            return firstCity // Already a city object from API
        }
        return null
    }

    // Featured regions
    const displayRegions = [
        { id: 'europe', name: 'Europe', emoji: '🇪🇺', color: 'from-blue-400 to-indigo-500' },
        { id: 'asia', name: 'Asia', emoji: '🌏', color: 'from-emerald-400 to-teal-500' },
        { id: 'north-america', name: 'Americas', emoji: '🌎', color: 'from-amber-400 to-orange-500' },
        { id: 'oceania', name: 'Oceania', emoji: '🌊', color: 'from-cyan-400 to-blue-500' },
    ]

    return (
        <div className="space-y-8 animate-fade-in pb-10">
            {/* Banner Image Section */}
            <section className="relative h-64 md:h-80 rounded-2xl overflow-hidden shadow-lg">
                <img
                    src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200"
                    alt="Travel Banner"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-brandDark-900/80 via-brandDark-900/50 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 shadow-sm">
                        Where will you go next?
                    </h1>
                    <p className="text-white/80 text-lg md:text-xl max-w-xl mb-6 shadow-sm">
                        Plan your dream trip, discover new places, and create unforgettable memories.
                    </p>
                    <Link to="/trips/new" className="btn-primary w-fit shadow-lg hover:shadow-xl hover:scale-105 transition-all">
                        <PlusCircle className="w-5 h-5" />
                        Plan a Trip
                    </Link>
                </div>
            </section>

            {/* Top Regional Selection */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-brandDark-900 dark:text-white">Top Regional Selection</h2>
                    <Link to="/cities" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 hover:underline">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {displayRegions.map(region => (
                        <Link
                            key={region.id}
                            to={`/cities?region=${region.id}`}
                            className="card card-hover p-4 flex items-center gap-3 group dark:bg-brandDark-800 border dark:border-slate-700"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${region.color} flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                                {region.emoji}
                            </div>
                            <div>
                                <h3 className="font-semibold text-brandDark-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{region.name}</h3>
                                <p className="text-sm text-gray-500 dark:text-slate-400">Explore cities</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Previous Trips */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-brandDark-900 dark:text-white">Previous Trips</h2>
                    <Link to="/trips" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 hover:underline">
                        View All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {isLoading ? (
                    <div className="card p-8 text-center dark:bg-brandDark-800 border dark:border-slate-700">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                        <p className="text-gray-500 dark:text-slate-400 mt-2">Loading your trips...</p>
                    </div>
                ) : trips.length === 0 ? (
                    <div className="card p-8 text-center dark:bg-brandDark-800 border dark:border-slate-700">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MapPin className="w-8 h-8 text-gray-400 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-brandDark-900 dark:text-white mb-2">No trips yet</h3>
                        <p className="text-gray-500 dark:text-slate-400 mb-4">Start planning your first adventure!</p>
                        <Link to="/trips/new" className="btn-primary inline-flex hover:scale-105 transition-transform">
                            <PlusCircle className="w-5 h-5" />
                            Plan Your First Trip
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {trips.slice(0, 3).map(trip => {
                            const firstCity = getFirstCity(trip)
                            const cityCount = trip.cities?.length || (trip.cityIds?.length) || 0
                            const coverImage = trip.coverImage || trip.cover_image || firstCity?.imageUrl || firstCity?.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
                            const tripStatus = trip.status === 'active' ? 'ongoing' : trip.status
                            return (
                                <Link
                                    key={trip.id}
                                    to={`/trips/${trip.id}`}
                                    className="card card-hover overflow-hidden group dark:bg-brandDark-800 border dark:border-slate-700"
                                >
                                    <div className="aspect-video relative overflow-hidden">
                                        <img
                                            src={coverImage}
                                            alt={trip.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className={`absolute top-3 left-3 shadow-md ${tripStatus === 'ongoing' || tripStatus === 'active' ? 'status-ongoing' :
                                            tripStatus === 'upcoming' ? 'status-upcoming' : 'status-completed'
                                            }`}>
                                            {tripStatus.charAt(0).toUpperCase() + tripStatus.slice(1)}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-brandDark-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{trip.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 mb-2">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(trip.startDate || trip.start_date).toLocaleDateString()} - {new Date(trip.endDate || trip.end_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
                                            <MapPin className="w-4 h-4" />
                                            <span>{cityCount} {cityCount === 1 ? 'city' : 'cities'}</span>
                                            {firstCity && <span>• {firstCity.name}</span>}
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </section>

            {/* Ongoing/Upcoming Trip Alert */}
            {(ongoingTrips.length > 0 || upcomingTrips.length > 0) && (
                <section>
                    <h2 className="text-xl font-semibold text-brandDark-900 dark:text-white mb-4">Your Upcoming Adventures</h2>
                    <div className="space-y-3">
                        {ongoingTrips.map(trip => {
                            const firstCity = getFirstCity(trip)
                            const coverImage = trip.coverImage || trip.cover_image || firstCity?.imageUrl || firstCity?.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
                            const cityCount = trip.cities?.length || 0
                            return (
                                <Link
                                    key={trip.id}
                                    to={`/trips/${trip.id}`}
                                    className="card p-4 flex items-center gap-4 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow dark:bg-brandDark-800 dark:border-slate-700 dark:border-l-emerald-500"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={coverImage} alt={trip.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="status-ongoing">Ongoing</span>
                                            <h3 className="font-semibold text-brandDark-900 dark:text-white">{trip.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                            Currently traveling • {cityCount} cities
                                        </p>
                                    </div>
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                </Link>
                            )
                        })}
                        {upcomingTrips.slice(0, 2).map(trip => {
                            const firstCity = getFirstCity(trip)
                            const coverImage = trip.coverImage || trip.cover_image || firstCity?.imageUrl || firstCity?.image_url || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800'
                            const cityCount = trip.cities?.length || 0
                            return (
                                <Link
                                    key={trip.id}
                                    to={`/trips/${trip.id}`}
                                    className="card p-4 flex items-center gap-4 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow dark:bg-brandDark-800 dark:border-slate-700 dark:border-l-blue-500"
                                >
                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={coverImage} alt={trip.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="status-upcoming">Upcoming</span>
                                            <h3 className="font-semibold text-brandDark-900 dark:text-white">{trip.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                                            Starts {new Date(trip.startDate || trip.start_date).toLocaleDateString()} • {cityCount} cities
                                        </p>
                                    </div>
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                </Link>
                            )
                        })}
                    </div>
                </section>
            )}

            {/* Popular Destinations */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-brandDark-900 dark:text-white">Popular Destinations</h2>
                    <Link to="/cities" className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center gap-1 hover:underline">
                        Explore All <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {cities.slice(0, 6).map(city => (
                        <Link
                            key={city.id}
                            to={`/cities?search=${city.name}`}
                            className="card card-hover overflow-hidden group dark:bg-brandDark-800 border dark:border-slate-700"
                        >
                            <div className="aspect-square relative overflow-hidden">
                                <img
                                    src={city.image || city.imageUrl || city.image_url}
                                    alt={city.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                    <h3 className="font-semibold text-white text-sm">{city.name}</h3>
                                    <div className="flex items-center gap-1 text-white/80 text-xs">
                                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                        <span>{city.rating || city.popularity}% popular</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Plan a Trip CTA */}
            <section className="card bg-gradient-to-r from-orange-500 to-rose-500 p-8 text-center text-white border-0 shadow-lg">
                <h2 className="text-2xl font-bold mb-2">Ready for Your Next Adventure?</h2>
                <p className="text-white/90 mb-6">Start planning your perfect trip today</p>
                <Link to="/trips/new" className="btn bg-white text-orange-600 hover:bg-gray-100 shadow-lg hover:scale-105 transition-transform">
                    <PlusCircle className="w-5 h-5" />
                    Plan a Trip
                </Link>
            </section>
        </div>
    )
}
