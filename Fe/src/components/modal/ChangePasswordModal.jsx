import React, { useState } from 'react'
import axiosInstance from '@/network/httpRequest'
import Swal from 'sweetalert2'

const ChangePasswordModal = ({ onClose }) => {
    const [form, setForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
      
        const { currentPassword, newPassword, confirmPassword } = form
      
        if (newPassword !== confirmPassword) {
          Swal.fire({
            icon: 'warning',
            title: 'Mật khẩu không khớp',
            text: 'Vui lòng xác nhận lại mật khẩu mới.',
          })
          return
        }
      
        setLoading(true)
        try {
          await axiosInstance.put('/users/change-password', {
            currentPassword,
            newPassword,
          })
      
          Swal.fire({
            icon: 'success',
            title: 'Đổi mật khẩu thành công',
            text: 'Bạn đã đổi mật khẩu thành công.',
          })
      
          onClose()
        } catch (error) {
          Swal.fire({
            icon: 'error',
            title: 'Đổi mật khẩu thất bại',
            text:
              error?.response?.data?.message ||
              'Đã có lỗi xảy ra, vui lòng thử lại.',
          })
        } finally {
          setLoading(false)
        }
      }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-xl"
                >
                    ✕
                </button>
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Đổi mật khẩu
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu hiện tại
                        </label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={form.currentPassword}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mật khẩu mới
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={form.newPassword}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-400"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md"
                    >
                        {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ChangePasswordModal
