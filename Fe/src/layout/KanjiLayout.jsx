import ScrollToTop from '@/components/scroll-to-top/ScrollToTop'
import { Outlet } from 'react-router-dom'
import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'

function KanjiLayout() {
    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <ScrollToTop />
            <Header />
            <div className="flex-1 flex justify-center items-start py-8">
                <div className="w-full max-w-7xl px-4">
                    <Outlet />
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default KanjiLayout
