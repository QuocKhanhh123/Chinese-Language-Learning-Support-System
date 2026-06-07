import React, { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import PeopleIcon from '@mui/icons-material/People'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

const NotificationStatsModal = ({ isOpen, onClose, notificationId, getStats }) => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (isOpen && notificationId) {
            loadStats()
        }
    }, [isOpen, notificationId])

    const loadStats = async () => {
        try {
            setLoading(true)
            const data = await getStats(notificationId)
            setStats(data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'text-red-600 bg-red-100'
            case 'high': return 'text-yellow-600 bg-yellow-100'
            case 'normal': return 'text-blue-600 bg-blue-100'
            case 'low': return 'text-gray-600 bg-gray-100'
            default: return 'text-gray-600 bg-gray-100'
        }
    }

    const getScopeText = (scope) => {
        switch (scope) {
            case 'all': return 'Tất cả'
            case 'teachers': return 'Giáo viên'
            case 'students': return 'Học sinh'
            case 'course': return 'Theo lớp'
            case 'individual': return 'Cá nhân'
            default: return scope
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Thống kê thông báo</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <CloseIcon style={{ fontSize: 24 }} />
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : stats ? (
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3">{stats.notification.title}</h3>
                            <p className="text-gray-700 mb-3">{stats.notification.message}</p>
                            
                            <div className="flex gap-2 flex-wrap">
                                <span className={`px-3 py-1 rounded-full text-sm ${getPriorityColor(stats.notification.priority)}`}>
                                    {stats.notification.priority.toUpperCase()}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-600">
                                    {getScopeText(stats.notification.scope)}
                                </span>
                                <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-600">
                                    {stats.notification.type}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <PeopleIcon style={{ fontSize: 20 }} className="text-blue-600" />
                                    <span className="text-sm text-gray-600">Tổng người nhận</span>
                                </div>
                                <p className="text-2xl font-bold text-blue-600">
                                    {stats.stats.totalRecipients}
                                </p>
                            </div>

                            <div className="bg-green-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <VisibilityIcon style={{ fontSize: 20 }} className="text-green-600" />
                                    <span className="text-sm text-gray-600">Đã đọc</span>
                                </div>
                                <p className="text-2xl font-bold text-green-600">
                                    {stats.stats.readCount}
                                </p>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <VisibilityOffIcon style={{ fontSize: 20 }} className="text-orange-600" />
                                    <span className="text-sm text-gray-600">Chưa đọc</span>
                                </div>
                                <p className="text-2xl font-bold text-orange-600">
                                    {stats.stats.unreadCount}
                                </p>
                            </div>

                            <div className="bg-purple-50 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-sm text-gray-600">Tỷ lệ đọc</span>
                                </div>
                                <p className="text-2xl font-bold text-purple-600">
                                    {stats.stats.readPercentage}%
                                </p>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-gradient-to-r from-green-400 to-green-600 h-4 rounded-full transition-all"
                                    style={{ width: `${stats.stats.readPercentage}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2 text-center">
                                {stats.stats.readCount} / {stats.stats.totalRecipients} người đã đọc
                            </p>
                        </div>

                        <div className="text-sm text-gray-500">
                            <p>Ngày tạo: {new Date(stats.notification.createdAt).toLocaleString('vi-VN')}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Không có dữ liệu</p>
                )}

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    )
}

export default NotificationStatsModal
