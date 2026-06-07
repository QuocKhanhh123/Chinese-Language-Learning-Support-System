import React, { useState, useEffect } from 'react'
import AddIcon from '@mui/icons-material/Add'
import SearchIcon from '@mui/icons-material/Search'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import BarChartIcon from '@mui/icons-material/BarChart'
import FilterListIcon from '@mui/icons-material/FilterList'
import { useNotifications } from '../../hooks/useNotifications'
import { useCourses } from '../../hooks/useCourses'
import NotificationFormModal from '../../components/modal/NotificationFormModal'
import NotificationStatsModal from '../../components/modal/NotificationStatsModal'

const NotificationManagement = () => {
    const {
        notifications,
        loading,
        pagination,
        fetchNotifications,
        createNotification,
        updateNotification,
        deleteNotification,
        getStats
    } = useNotifications(true)

    const { data: courses = [] } = useCourses()

    const [isFormModalOpen, setIsFormModalOpen] = useState(false)
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState(null)
    const [selectedNotificationId, setSelectedNotificationId] = useState(null)

    const [filters, setFilters] = useState({
        scope: '',
        status: '',
        priority: '',
        search: ''
    })

    const [currentPage, setCurrentPage] = useState(1)

    useEffect(() => {
        handleFilter()
    }, [currentPage])

    const handleFilter = () => {
        const params = {
            page: currentPage,
            limit: 20,
            ...filters
        }

        Object.keys(params).forEach(key => {
            if (!params[key]) delete params[key]
        })

        fetchNotifications(params)
    }

    const handleCreate = () => {
        setSelectedNotification(null)
        setIsFormModalOpen(true)
    }

    const handleEdit = (notification) => {
        setSelectedNotification(notification)
        setIsFormModalOpen(true)
    }

    const handleDelete = async (notificationId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
            await deleteNotification(notificationId)
        }
    }

    const handleViewStats = (notificationId) => {
        setSelectedNotificationId(notificationId)
        setIsStatsModalOpen(true)
    }

    const handleFormSubmit = async (data) => {
        try {
            if (selectedNotification) {
                await updateNotification(selectedNotification._id, data)
            } else {
                await createNotification(data)
            }
            setIsFormModalOpen(false)
        } catch (error) {
            console.error(error)
        }
    }

    const getPriorityBadge = (priority) => {
        const colors = {
            urgent: 'bg-red-100 text-red-700',
            high: 'bg-yellow-100 text-yellow-700',
            normal: 'bg-blue-100 text-blue-700',
            low: 'bg-gray-100 text-gray-700'
        }
        return colors[priority] || colors.normal
    }

    const getStatusBadge = (status) => {
        const colors = {
            draft: 'bg-gray-100 text-gray-700',
            published: 'bg-green-100 text-green-700',
            archived: 'bg-purple-100 text-purple-700'
        }
        return colors[status] || colors.draft
    }

    const getScopeText = (scope) => {
        const texts = {
            all: 'Tất cả',
            teachers: 'Giáo viên',
            students: 'Học sinh',
            course: 'Theo lớp',
            individual: 'Cá nhân'
        }
        return texts[scope] || scope
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Quản lý thông báo</h1>
                        <p className="text-sm text-gray-500 mt-1">Quản lý và gửi thông báo đến người dùng</p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                        <AddIcon style={{ fontSize: 20 }} />
                        Tạo thông báo mới
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <FilterListIcon style={{ fontSize: 18 }} className="text-gray-400" />
                        <h3 className="font-medium text-gray-700">Bộ lọc</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={filters.search}
                                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            />
                        </div>
                        <div>
                            <select
                                value={filters.scope}
                                onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tất cả đối tượng</option>
                                <option value="teachers">Giáo viên</option>
                                <option value="students">Học sinh</option>
                                <option value="course">Theo lớp</option>
                                <option value="individual">Cá nhân</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tất cả trạng thái</option>
                                <option value="draft">Nháp</option>
                                <option value="published">Đã xuất bản</option>
                                <option value="archived">Đã lưu trữ</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filters.priority}
                                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            >
                                <option value="">Tất cả mức độ</option>
                                <option value="urgent">Khẩn cấp</option>
                                <option value="high">Cao</option>
                                <option value="normal">Bình thường</option>
                                <option value="low">Thấp</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleFilter}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                            Áp dụng bộ lọc
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-600 border-t-transparent"></div>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Đối tượng</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mức độ</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {notifications.map((notification) => (
                                        <tr key={notification._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-gray-900">{notification.title}</p>
                                                    <p className="text-sm text-gray-500 truncate max-w-xs">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-gray-700">
                                                    {getScopeText(notification.scope)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(notification.priority)}`}>
                                                    {notification.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(notification.status)}`}>
                                                    {notification.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(notification.createdAt).toLocaleDateString('vi-VN')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleViewStats(notification._id)}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Xem thống kê"
                                                    >
                                                        <BarChartIcon style={{ fontSize: 18 }} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEdit(notification)}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Chỉnh sửa"
                                                    >
                                                        <EditIcon style={{ fontSize: 18 }} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(notification._id)}
                                                        className="text-red-600 hover:text-red-800"
                                                        title="Xóa"
                                                    >
                                                        <DeleteIcon style={{ fontSize: 18 }} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {notifications.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                Không có thông báo nào
                            </div>
                        )}

                        {pagination.pages > 1 && (
                            <div className="flex justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Trước
                                </button>
                                <span className="px-4 py-2">
                                    Trang {currentPage} / {pagination.pages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                    disabled={currentPage === pagination.pages}
                                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                                >
                                    Sau
                                </button>
                            </div>
                        )}
                    </>
                )}

                <NotificationFormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    onSubmit={handleFormSubmit}
                    notification={selectedNotification}
                    courses={courses}
                />

                <NotificationStatsModal
                    isOpen={isStatsModalOpen}
                    onClose={() => setIsStatsModalOpen(false)}
                    notificationId={selectedNotificationId}
                    getStats={getStats}
                />
            </div>
        </div>
    )
}

export default NotificationManagement
