import DocumentSidebar from '@/components/document-sidebar/DocumentSidebar'
import { Outlet } from 'react-router-dom'

function ManageDocumentLayout() {
    return (
        <div className="flex w-full min-h-screen">
            <div className="w-[300px] hidden lg:block">
                <DocumentSidebar />
            </div>
            <div className="flex-1 p-6">
                <Outlet />
            </div>
        </div>
    )
}

export default ManageDocumentLayout
