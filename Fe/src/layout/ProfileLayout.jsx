import React from 'react'
import Header from '@/components/header/Header'
import Footer from '@/components/footer/Footer'
import ScrollToTop from '@/components/scroll-to-top/ScrollToTop'
import { Outlet } from 'react-router-dom'

const UserLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <ScrollToTop />
            <Header />

            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}

export default UserLayout
