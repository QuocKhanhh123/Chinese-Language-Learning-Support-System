import React, { useState, useEffect } from 'react'
import CloseIcon from '@mui/icons-material/Close'

const NotificationFormModal = ({ isOpen, onClose, onSubmit, notification = null, courses = [] }) => {
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        scope: 'all',
        targetCourse: '',
        targetUser: '',
        priority: 'normal',
        type: 'announcement',
        status: 'published'
    })

    useEffect(() => {
        if (notification) {
            setFormData({
                title: notification.title || '',
                message: notification.message || '',
                scope: notification.scope || 'all',
                targetCourse: notification.targetCourse?._id || '',
                targetUser: notification.targetUser?._id || '',
                priority: notification.priority || 'normal',
                type: notification.type || 'announcement',
                status: notification.status || 'published'
            })
        } else {
            setFormData({
                title: '',
                message: '',
                scope: 'all',
                targetCourse: '',
                targetUser: '',
                priority: 'normal',
                type: 'announcement',
                status: 'published'
            })
        }
    }, [notification])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const submitData = { ...formData }
        
        if (formData.scope !== 'course') {
            delete submitData.targetCourse
        }
        if (formData.scope !== 'individual') {
            delete submitData.targetUser
        }

        onSubmit(submitData)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">
                        {notification ? 'Chỉnh sửa thông báo' : 'Tạo thông báo mới'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <CloseIcon style={{ fontSize: 24 }} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập tiêu đề thông báo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Nội dung *</label>
                        <textarea
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            required
                            rows={4}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nhập nội dung thông báo"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Đối tượng *</label>
                            <select
                                name="scope"
                                value={formData.scope}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">Tất cả</option>
                                <option value="teachers">Giáo viên</option>
                                <option value="students">Học sinh</option>
                                <option value="course">Theo lớp học</option>
                                <option value="individual">Cá nhân</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Độ ưu tiên *</label>
                            <select
                                name="priority"
                                value={formData.priority}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="low">Thấp</option>
                                <option value="normal">Bình thường</option>
                                <option value="high">Cao</option>
                                <option value="urgent">Khẩn cấp</option>
                            </select>
                        </div>
                    </div>

                    {formData.scope === 'course' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">Chọn lớp học *</label>
                            <select
                                name="targetCourse"
                                value={formData.targetCourse}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">-- Chọn lớp học --</option>
                                {courses.map(course => (
                                    <option key={course._id} value={course._id}>
                                        {course.title}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {formData.scope === 'individual' && (
                        <div>
                            <label className="block text-sm font-medium mb-1">ID người dùng *</label>
                            <input
                                type="text"
                                name="targetUser"
                                value={formData.targetUser}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Nhập ID người dùng"
                            />
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Loại thông báo *</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="announcement">Thông báo</option>
                                <option value="system">Hệ thống</option>
                                <option value="exam">Kỳ thi</option>
                                <option value="personal">Cá nhân</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Trạng thái *</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="draft">Nháp</option>
                                <option value="published">Đã xuất bản</option>
                                <option value="archived">Đã lưu trữ</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            {notification ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default NotificationFormModal
