import { useState, useEffect, useRef } from 'react'
import notificationService from '../utils/services/notificationService'
import { toast } from 'react-toastify'

export const useNotifications = (isAdmin = false) => {
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        pages: 0
    })
    const [unreadCount, setUnreadCount] = useState(0)
    const lastParamsRef = useRef({})

    const fetchNotifications = async (params = {}) => {
        try {
            setLoading(true)
            // Lưu params để dùng lại khi refresh
            lastParamsRef.current = params
            
            const response = isAdmin
                ? await notificationService.getAdminNotifications(params)
                : await notificationService.getMyNotifications(params)

            if (response.success) {
                // Xử lý nhiều format response từ backend
                let notificationsList = []
                let paginationData = { total: 0, page: 1, limit: 20, pages: 0 }
                let unread = 0

                if (Array.isArray(response.data)) {
                    // Format: { data: [], meta: { pagination, unreadCount } }
                    notificationsList = response.data
                    paginationData = response.meta?.pagination || paginationData
                    unread = response.meta?.unreadCount || 0
                } else if (response.message && typeof response.message === 'object') {
                    // Format: { message: { notifications: [], pagination, unreadCount } }
                    notificationsList = response.message.notifications || []
                    paginationData = response.message.pagination || paginationData
                    unread = response.message.unreadCount || 0
                } else if (response.data && typeof response.data === 'object') {
                    // Format: { data: { notifications: [], pagination, unreadCount } }
                    notificationsList = response.data.notifications || []
                    paginationData = response.data.pagination || paginationData
                    unread = response.data.unreadCount || 0
                }

                setNotifications(notificationsList)
                setPagination(paginationData)
                if (!isAdmin) {
                    setUnreadCount(unread)
                }
            }
        } catch (error) {
            toast.error('Không thể tải thông báo')
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const refreshNotifications = () => {
        // Sử dụng params cuối cùng để refresh
        return fetchNotifications(lastParamsRef.current)
    }

    const createNotification = async (data) => {
        try {
            setLoading(true)
            const response = await notificationService.create(data)
            if (response.success) {
                toast.success('Tạo thông báo thành công')
                await refreshNotifications()
                return response.message || response.data
            }
        } catch (error) {
            toast.error('Không thể tạo thông báo')
            console.error(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const updateNotification = async (notificationId, data) => {
        try {
            setLoading(true)
            const response = await notificationService.update(notificationId, data)
            if (response.success) {
                toast.success('Cập nhật thông báo thành công')
                await refreshNotifications()
                return response.message || response.data
            }
        } catch (error) {
            toast.error('Không thể cập nhật thông báo')
            console.error(error)
            throw error
        } finally {
            setLoading(false)
        }
    }

    const deleteNotification = async (notificationId) => {
        try {
            const response = isAdmin
                ? await notificationService.delete(notificationId)
                : await notificationService.deleteMyNotification(notificationId)

            if (response.success) {
                // Cập nhật state ngay lập tức để UI phản hồi nhanh
                setNotifications(prev => prev.filter(n => n._id !== notificationId))
                
                // Cập nhật unread count nếu notification đã xóa là chưa đọc
                const deletedNotification = notifications.find(n => n._id === notificationId)
                if (deletedNotification && !deletedNotification.isRead && !isAdmin) {
                    setUnreadCount(prev => Math.max(0, prev - 1))
                }
                
                toast.success('Xóa thông báo thành công')
                
                // Fetch lại để đồng bộ với server (không setLoading để tránh UI bị nhấp nháy)
                await refreshNotifications()
            }
        } catch (error) {
            toast.error('Không thể xóa thông báo')
            console.error(error)
        }
    }

    const markAsRead = async (notificationId) => {
        try {
            // Cập nhật UI ngay lập tức
            setNotifications(prev => 
                prev.map(n => 
                    n._id === notificationId 
                        ? { ...n, isRead: true } 
                        : n
                )
            )
            
            // Giảm unread count
            const notification = notifications.find(n => n._id === notificationId)
            if (notification && !notification.isRead && !isAdmin) {
                setUnreadCount(prev => Math.max(0, prev - 1))
            }
            
            // Gọi API
            await notificationService.markAsRead(notificationId)
            
            // Refresh để đồng bộ với server
            await refreshNotifications()
        } catch (error) {
            console.error(error)
            toast.error('Không thể đánh dấu đã đọc')
            // Rollback nếu có lỗi
            await refreshNotifications()
        }
    }

    const markAllAsRead = async () => {
        try {
            // Cập nhật UI ngay lập tức
            setNotifications(prev => 
                prev.map(n => ({ ...n, isRead: true }))
            )
            setUnreadCount(0)
            
            await notificationService.markAllAsRead()
            toast.success('Đã đánh dấu tất cả là đã đọc')
            
            // Refresh để đồng bộ với server
            await refreshNotifications()
        } catch (error) {
            toast.error('Không thể đánh dấu đã đọc')
            console.error(error)
            // Rollback nếu có lỗi
            await refreshNotifications()
        }
    }

    const getStats = async (notificationId) => {
        try {
            const response = await notificationService.getStats(notificationId)
            return response.message || response.data
        } catch (error) {
            toast.error('Không thể tải thống kê')
            console.error(error)
            throw error
        }
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    return {
        notifications,
        loading,
        pagination,
        unreadCount,
        fetchNotifications,
        createNotification,
        updateNotification,
        deleteNotification,
        markAsRead,
        markAllAsRead,
        getStats
    }
}
