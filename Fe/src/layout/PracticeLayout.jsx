import PracticeSidebar from '@/components/practice/practiceSideBar/PracticeSidebar'
import { Outlet } from 'react-router-dom'

export default function PracticeLayout() {
  return (
    <div className="flex w-full min-h-screen">
      <PracticeSidebar />
      <div className="flex-1 p-6">
        <Outlet />
      </div>
    </div>
  )
}