import { Group } from '@mantine/core'
import { Outlet } from 'react-router-dom'
import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'
import ScrollToTop from '../components/scroll-to-top/ScrollToTop'

function MainLayout({ isFooter = true, isFullWidth = false }) {
    return (
        <div>
            <ScrollToTop />
            <Header />

            {isFullWidth ? (
                <Outlet />
            ) : (
                <Group w="100%" justify="center">
                    <Group maw={1440} w="100%">
                        <Outlet />
                    </Group>
                </Group>
            )}

            {isFooter && <Footer />}
        </div>
    )
}

export default MainLayout
