import { useParams, Link } from 'react-router-dom'
import { Calendar, MapPin, Copy, Share2, Heart, Globe } from 'lucide-react'
import tripsData from '../data/trips.json'
import citiesData from '../data/cities.json'

export default function SharedItinerary() {
    const { id } = useParams()
    const trip = tripsData.trips.find(t => t.id === id)

    if (!trip || !trip.isPublic) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="card p-8 text-center max-w-md">
                    <Globe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-dark-900 mb-2">Itinerary Not Found</h2>
                    <p className="text-gray-500 mb-4">This trip is either private or doesn't exist.</p>
                    <Link to="/" className="btn-primary">Go to Homepage</Link>
                </div>
            </div>
        )
    }

    const getCityData = (cityId: string) => citiesData.cities.find(c => c.id === cityId)

    // Following Screen 11 - Shared/Public Itinerary View
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4">
                {/* Header */}
                <div className="card overflow-hidden mb-6">
                    <div className="h-56 relative">
                        <img src={trip.coverImage} alt={trip.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <span className="badge bg-white/20 backdrop-blur text-white mb-2">
                                <Globe className="w-3 h-3" />Public Itinerary
                            </span>
                            <h1 className="text-3xl font-bold text-white mb-2">{trip.name}</h1>
                            <div className="flex items-center gap-4 text-white/80">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{trip.cities.length} cities</span>
                                <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{trip.likes}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div className="card p-6 mb-6">
                    <p className="text-gray-600">{trip.description}</p>
                </div>

                {/* Cities */}
                <div className="card p-6 mb-6">
                    <h2 className="font-semibold text-dark-900 mb-4">Destinations</h2>
                    <div className="flex gap-4 overflow-x-auto pb-2">
                        {trip.cities.map(cityId => {
                            const city = getCityData(cityId)
                            if (!city) return null
                            return (
                                <div key={cityId} className="flex-shrink-0 w-40">
                                    <img src={city.image} alt={city.name} className="w-full h-24 rounded-xl object-cover mb-2" />
                                    <p className="font-medium text-dark-900">{city.name}</p>
                                    <p className="text-sm text-gray-500">{city.country}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button className="btn-primary flex-1">
                        <Copy className="w-5 h-5" />Copy Trip
                    </button>
                    <button className="btn-outline flex-1">
                        <Share2 className="w-5 h-5" />Share
                    </button>
                </div>
            </div>
        </div>
    )
}
