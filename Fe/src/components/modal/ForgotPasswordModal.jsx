import React, { useState } from 'react'
import axiosInstance from '@/network/httpRequest'
import Swal from 'sweetalert2'

const ForgotPasswordModal = ({ onClose }) => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        try {
            const res = await axiosInstance.post('/user/forgot-password', {
                email,
            })
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: 'Liên kết đặt lại mật khẩu đã được gửi đến email của bạn.',
            })
            console.log('res', res)
            onClose()
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text:
                    error?.response?.data?.message ||
                    'Gửi email thất bại, vui lòng thử lại.',
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
                    Lấy lại mật khẩu
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email đã đăng ký
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-400"
                            placeholder="you@example.com"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-md transition"
                    >
                        {loading
                            ? 'Đang gửi...'
                            : 'Gửi liên kết đặt lại mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default ForgotPasswordModal
