import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import NotificationsIcon from '@mui/icons-material/Notifications'
import FilterListIcon from '@mui/icons-material/FilterList'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import DoneAllIcon from '@mui/icons-material/DoneAll'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import InboxIcon from '@mui/icons-material/Inbox'
import { useNotifications } from '../../hooks/useNotifications'

const MyNotifications = () => {
    const navigate = useNavigate()
    const {
        notifications,
        loading,
        pagination,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications(false)

    const [filter, setFilter] = useState('all')
    const [currentPage, setCurrentPage] = useState(1)

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter)
        setCurrentPage(1)
        fetchNotifications({
            page: 1,
            limit: 20,
            unreadOnly: newFilter === 'unread'
        })
    }

    const handlePageChange = (page) => {
        setCurrentPage(page)
        fetchNotifications({
            page,
            limit: 20,
            unreadOnly: filter === 'unread'
        })
    }

    const getPriorityStyle = (priority) => {
        const styles = {
            urgent: 'border-l-4 border-red-600',
            high: 'border-l-4 border-amber-500',
            normal: 'border-l-4 border-gray-300',
            low: 'border-l-4 border-gray-200'
        }
        return styles[priority] || styles.normal
    }

    const getPriorityLabel = (priority) => {
        const labels = {
            urgent: { text: 'Khẩn cấp', class: 'bg-red-100 text-red-700' },
            high: { text: 'Quan trọng', class: 'bg-amber-100 text-amber-700' },
            normal: { text: 'Bình thường', class: 'bg-gray-100 text-gray-600' },
            low: { text: 'Thấp', class: 'bg-gray-100 text-gray-500' }
        }
        return labels[priority] || labels.normal
    }

    const getTypeLabel = (type) => {
        const types = {
            system: 'Hệ thống',
            course: 'Khóa học',
            exam: 'Bài thi',
            reminder: 'Nhắc nhở',
            promotion: 'Khuyến mãi'
        }
        return types[type] || type
    }

    const formatTime = (date) => {
        const now = new Date()
        const diff = now - new Date(date)
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return 'Vừa xong'
        if (minutes < 60) return `${minutes} phút trước`
        if (hours < 24) return `${hours} giờ trước`
        if (days < 7) return `${days} ngày trước`
        return new Date(date).toLocaleDateString('vi-VN')
    }

    return (
        <div className="min-h-screen bg-gray-50 w-full">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition text-sm mb-6"
                >
                    <ArrowBackIcon fontSize="small" />
                    Quay lại
                </button>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <NotificationsIcon className="text-red-600" />
                            </div>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900">Thông báo</h1>
                                <p className="text-sm text-gray-500">
                                    {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}
                                </p>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded transition text-sm font-medium"
                            >
                                <DoneAllIcon fontSize="small" />
                                Đánh dấu tất cả đã đọc
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 mb-4">
                    <FilterListIcon fontSize="small" className="text-gray-400" />
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleFilterChange('all')}
                            className={`px-3 py-1.5 text-sm rounded transition ${filter === 'all'
                                ? 'bg-red-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-600 hover:border-red-300'
                                }`}
                        >
                            Tất cả ({pagination.total})
                        </button>
                        <button
                            onClick={() => handleFilterChange('unread')}
                            className={`px-3 py-1.5 text-sm rounded transition ${filter === 'unread'
                                ? 'bg-red-600 text-white'
                                : 'bg-white border border-gray-300 text-gray-600 hover:border-red-300'
                                }`}
                        >
                            Chưa đọc ({unreadCount})
                        </button>
                    </div>
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-600 border-t-transparent mx-auto"></div>
                        <p className="text-gray-500 mt-3 text-sm">Đang tải...</p>
                    </div>
                ) : (
                    <>
                        {/* Notification List */}
                        <div className="space-y-3">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition hover:shadow ${!notification.isRead ? 'bg-red-50/30' : ''
                                        } ${getPriorityStyle(notification.priority)}`}
                                >
                                    <div className="flex justify-between items-start gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className={`font-medium text-gray-900 truncate ${!notification.isRead ? 'font-semibold' : ''}`}>
                                                    {notification.title}
                                                </h3>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                                                )}
                                            </div>
                                            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                                <span className="text-gray-400">
                                                    {formatTime(notification.createdAt)}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded ${getPriorityLabel(notification.priority).class}`}>
                                                    {getPriorityLabel(notification.priority).text}
                                                </span>
                                                <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                                                    {getTypeLabel(notification.type)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={() => markAsRead(notification._id)}
                                                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition"
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <CheckCircleOutlineIcon fontSize="small" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteNotification(notification._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                                                title="Xóa"
                                            >
                                                <DeleteOutlineIcon fontSize="small" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {notifications.length === 0 && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <InboxIcon className="text-gray-300 mb-3" style={{ fontSize: 48 }} />
                                <p className="text-gray-500">Không có thông báo nào</p>
                            </div>
                        )}

                        {/* Pagination */}
                        {pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 mt-6">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-300 transition"
                                >
                                    Trước
                                </button>
                                <span className="px-3 py-1.5 text-sm text-gray-600">
                                    {currentPage} / {pagination.pages}
                                </span>
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === pagination.pages}
                                    className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:border-red-300 transition"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default MyNotifications
