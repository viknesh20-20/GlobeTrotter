import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { Loader2 } from 'lucide-react'

// Layouts
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'

// Pages
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import MyTrips from './pages/MyTrips'
import CreateTrip from './pages/CreateTrip'
import ItineraryBuilder from './pages/ItineraryBuilder'
import ItineraryView from './pages/ItineraryView'
import Profile from './pages/Profile'
import CitySearch from './pages/CitySearch'
import ActivitySearch from './pages/ActivitySearch'
import Calendar from './pages/Calendar'
import Community from './pages/Community'
import SharedItinerary from './pages/SharedItinerary'
import AdminDashboard from './pages/AdminDashboard'

// Protected Route Component with RBAC
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
    const { isAuthenticated, isLoading, user } = useAuth()

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-white dark:bg-slate-900">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        )
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace /> // Unauthorized access redirects home
    }

    return <Outlet />
}

function App() {
    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>
            <Route path="/shared/:id" element={<SharedItinerary />} />

            {/* Protected App Routes */}
            <Route element={<ProtectedRoute allowedRoles={['traveler', 'admin', 'agency']} />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/trips" element={<MyTrips />} />
                    <Route path="/trips/new" element={<CreateTrip />} />
                    <Route path="/trips/:id" element={<ItineraryView />} />
                    <Route path="/trips/:id/edit" element={<ItineraryBuilder />} />
                    <Route path="/cities" element={<CitySearch />} />
                    <Route path="/activities" element={<ActivitySearch />} />
                    <Route path="/calendar" element={<Calendar />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/profile" element={<Profile />} />
                </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route element={<MainLayout />}>
                    <Route path="/admin" element={<AdminDashboard />} />
                </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
