import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import NotificationsIcon from '@mui/icons-material/Notifications'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import DeleteIcon from '@mui/icons-material/Delete'
import { useNotifications } from '../../hooks/useNotifications'
import useAuthStore from '../../store/useAuthStore'

const NotificationBell = () => {
    const { user } = useAuthStore()

    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotifications(false)

    const [isOpen, setIsOpen] = useState(false)
    const [showUnreadOnly, setShowUnreadOnly] = useState(false)

    // Chỉ hiển thị cho teacher và student, không hiển thị cho admin
    if (!user || user.role === 'admin') {
        return null
    }

    useEffect(() => {
        if (user && (user.role === 'teacher' || user.role === 'student')) {
            fetchNotifications({ unreadOnly: showUnreadOnly })
        }
    }, [showUnreadOnly, user])

    const handleMarkAsRead = async (notificationId, e) => {
        e.stopPropagation()
        await markAsRead(notificationId)
    }

    const handleDelete = async (notificationId, e) => {
        e.stopPropagation()
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            await deleteNotification(notificationId)
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'border-l-4 border-red-600 bg-red-50'
            case 'high': return 'border-l-4 border-amber-500 bg-amber-50'
            case 'normal': return 'border-l-4 border-red-300 bg-stone-50'
            case 'low': return 'border-l-4 border-stone-300 bg-stone-50'
            default: return 'border-l-4 border-stone-300 bg-stone-50'
        }
    }

    const displayNotifications = showUnreadOnly
        ? (notifications || []).filter(n => !n.isRead)
        : (notifications || [])

    // Chỉ hiển thị cho teacher và student, không hiển thị cho admin
    if (!user || user.role === 'admin') {
        return null
    }

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 hover:bg-red-50 rounded-full transition border border-transparent hover:border-red-200"
            >
                <NotificationsIcon style={{ fontSize: 24 }} className="text-red-700" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-red-100 z-50 max-h-[600px] flex flex-col overflow-hidden">
                    {/* Header với gradient đỏ */}
                    <div className="p-4 bg-gradient-to-r from-red-700 to-red-800 text-white">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg">Thông báo</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1 transition"
                            >
                                <CloseIcon style={{ fontSize: 20 }} />
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                                className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-medium transition ${showUnreadOnly
                                        ? 'bg-white text-red-700'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                    }`}
                            >
                                Chưa đọc ({unreadCount})
                            </button>
                            <button
                                onClick={markAllAsRead}
                                className="px-3 py-1.5 bg-white text-red-700 rounded-lg text-sm font-medium hover:bg-red-50 transition"
                            >
                                Đánh dấu tất cả
                            </button>
                        </div>
                    </div>

                    <div className="overflow-y-auto flex-1">
                        {displayNotifications.length === 0 ? (
                            <div className="p-8 text-center text-stone-500">
                                <NotificationsIcon style={{ fontSize: 48 }} className="mx-auto mb-2 text-red-200" />
                                <p>Không có thông báo</p>
                            </div>
                        ) : (
                            displayNotifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`p-4 border-b border-red-50 hover:bg-red-50/50 transition ${!notification.isRead ? 'bg-red-50/30' : 'bg-white'
                                        } ${getPriorityColor(notification.priority)}`}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-sm text-stone-800">
                                                    {notification.title}
                                                </h4>
                                                {!notification.isRead && (
                                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                )}
                                            </div>
                                            <p className="text-sm text-stone-600 mb-2 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-stone-400">
                                                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${notification.priority === 'urgent'
                                                        ? 'bg-red-100 text-red-700'
                                                        : notification.priority === 'high'
                                                            ? 'bg-amber-100 text-amber-700'
                                                            : 'bg-stone-100 text-stone-600'
                                                    }`}>
                                                    {notification.priority}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            {!notification.isRead && (
                                                <button
                                                    onClick={(e) => handleMarkAsRead(notification._id, e)}
                                                    className="p-1.5 hover:bg-red-100 rounded-full transition"
                                                    title="Đánh dấu đã đọc"
                                                >
                                                    <CheckIcon style={{ fontSize: 16 }} className="text-red-600" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => handleDelete(notification._id, e)}
                                                className="p-1.5 hover:bg-red-100 rounded-full transition"
                                                title="Xóa"
                                            >
                                                <DeleteIcon style={{ fontSize: 16 }} className="text-red-400 hover:text-red-600" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {displayNotifications.length > 0 && (
                        <div className="p-3 border-t border-red-100 bg-red-50/50 text-center">
                            <Link
                                to="/notifications"
                                onClick={() => setIsOpen(false)}
                                className="text-sm text-red-700 hover:text-red-800 font-medium hover:underline underline-offset-2 transition"
                            >
                                Xem tất cả
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default NotificationBell
