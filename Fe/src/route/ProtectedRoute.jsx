import { Navigate } from 'react-router-dom'
import useAuthStore from '@/store/useAuthStore'

const ProtectedRoute = ({ element, allowedRoles }) => {
    const { isAuthenticated, user } = useAuthStore()

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    if (!allowedRoles.includes(user?.role)) {
        return <Navigate to="/not-allowed" replace />
    }

    return element
}

export default ProtectedRoute