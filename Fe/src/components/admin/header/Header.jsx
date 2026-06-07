import { Link } from 'react-router-dom'
import { Button } from '@mui/material'
import { Input } from '@mantine/core'
import SearchIcon from '@mui/icons-material/Search'

function Header() {
    return (
        <header className="bg-red-600 text-white shadow-md py-4">
            <div className="container mx-auto flex justify-between items-center px-4">
                <div>
                    <Link to="/" className="text-2xl font-bold">
                        C-learning
                    </Link>
                </div>
                <nav className="hidden md:flex space-x-6 text-lg">
                    <Link to="/learning" className="hover:text-gray-200">
                        Học tập
                    </Link>
                    <Link to="/community" className="hover:text-gray-200">
                        Cộng đồng
                    </Link>
                    <Link to="/jlpt" className="hover:text-gray-200">
                        JLPT
                    </Link>
                    <Link to="/blog" className="hover:text-gray-200">
                        Blog
                    </Link>
                </nav>
                <div className="flex items-center space-x-4">
                    <div className="relative hidden md:block">
                        <Input
                            placeholder="Tìm kiếm từ vựng, Kanji..."
                            className="pl-10 bg-white rounded-md"
                        />
                        <SearchIcon className="absolute left-3 top-2 text-gray-500" />
                    </div>
                    <Button variant="outlined" color="inherit">
                        Đăng nhập
                    </Button>
                </div>
            </div>
        </header>
    )
}

export default Header
