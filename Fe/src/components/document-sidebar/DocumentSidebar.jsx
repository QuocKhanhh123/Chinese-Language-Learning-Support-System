import { MenuBook, Quiz } from '@mui/icons-material'
import { Link, useLocation } from 'react-router-dom'

const DocumentSidebar = () => {
    const location = useLocation()
    const menuItems = [
        {
            label: 'Bộ thẻ',
            icon: <MenuBook />,
            path: '/manage-document/flashcard',
        },
        // {
        //     label: 'Bài thi',
        //     icon: <Quiz />,
        //     path: '/manage-document/exam',
        // },
        {
            label: 'Từ vựng',
            icon: <Quiz />,
            path: '/manage-document/vocab',
        },
    ]

    const isActive = (path) => {
        return location.pathname.includes(path)
    }

    return (
        <div className="w-full py-5 px-3 bg-white border-r border-solid border-gray-300 h-full">
            <nav className="flex w-full flex-col gap-3">
                {menuItems.map((item) => (
                    <Link
                        key={item.label}
                        className={`flex items-center px-6 py-3 text-gray-700 rounded-lg hover:bg-red-100 transition-colors duration-200 ${
                            isActive(item.path)
                                ? 'bg-red-100 border-l-4 border-red-600'
                                : ''
                        }`}
                        to={item.path}
                    >
                        <span
                            className={`${
                                isActive(item.path)
                                    ? 'text-red-600'
                                    : 'text-gray-500'
                            } mr-3`}
                        >
                            {item.icon}
                        </span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>
        </div>
    )
}

export default DocumentSidebar
