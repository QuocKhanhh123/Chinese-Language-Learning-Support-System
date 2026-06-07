import {
    Menu,
    People,
    Book,
    Movie,
    Settings,
    BarChart,
    Notifications,
} from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'

const Sidebar = ({ collapsed, toggleSidebar }) => {
    const location = useLocation()
    const getActiveTab = (path) => {
        return location.pathname.startsWith(path)
    }

    return (
        <div
            className={`bg-red-700 text-red-50 transition-all duration-300 ${
                collapsed ? 'w-16' : 'w-64'
            }`}
        >
            <div className="flex items-center justify-between p-4 border-b border-red-500">
                {!collapsed && <h1 className="text-xl font-bold">Admin</h1>}
                <button
                    onClick={toggleSidebar}
                    className="p-1 rounded-md hover:bg-red-600"
                >
                    <Menu style={{ fontSize: 24 }} />
                </button>
            </div>

            <nav className="mt-6">
                {[
                    { to: '/admin/main', label: 'Tổng quan', icon: <BarChart /> },
                    { to: '/admin/students', label: 'Quản lý học viên', icon: <People /> },
                    { to: '/admin/teachers', label: 'Quản lý giáo viên', icon: <Book /> },
                    { to: '/admin/courses', label: 'Quản lý khóa học', icon: <Movie /> },
                    { to: '/admin/create-account', label: 'Tạo tài khoản', icon: <Settings /> },
                    { to: '/admin/notifications', label: 'Thông báo', icon: <Notifications /> },
                ].map((item) => (
                    <Link to={item.to} key={item.to}>
                        <div
                            className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200
                                ${
                                    getActiveTab(item.to)
                                        ? 'bg-red-900 text-white'
                                        : 'hover:bg-red-600 text-red-100'
                                }`}
                        >
                            {item.icon}
                            {!collapsed && <span className="ml-4">{item.label}</span>}
                        </div>
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default Sidebar
