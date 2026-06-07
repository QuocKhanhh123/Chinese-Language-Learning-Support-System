import httpRequest from '../../network/httpRequest'

const notificationService = {
    create: async (data) => {
        const response = await httpRequest.post('/notifications', data)
        return response.data
    },

    getAdminNotifications: async (params) => {
        const response = await httpRequest.get('/notifications/admin', { params })
        return response.data
    },

    getStats: async (notificationId) => {
        const response = await httpRequest.get(`/notifications/${notificationId}/stats`)
        return response.data
    },

    update: async (notificationId, data) => {
        const response = await httpRequest.patch(`/notifications/${notificationId}`, data)
        return response.data
    },

    delete: async (notificationId) => {
        const response = await httpRequest.delete(`/notifications/admin/${notificationId}`)
        return response.data
    },

    getMyNotifications: async (params) => {
        const response = await httpRequest.get('/notifications/my', { params })
        return response.data
    },

    markAsRead: async (notificationId) => {
        const response = await httpRequest.patch(`/notifications/${notificationId}/read`)
        return response.data
    },

    markAllAsRead: async () => {
        const response = await httpRequest.patch('/notifications/read-all')
        return response.data
    },

    deleteMyNotification: async (notificationId) => {
        const response = await httpRequest.delete(`/notifications/${notificationId}`)
        return response.data
    }
}

export default notificationService
