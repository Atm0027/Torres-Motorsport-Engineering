import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { NotificationContainer } from '@components/ui/NotificationContainer'

export function MainLayout() {
    return (
        <div className="flex h-screen bg-torres-dark-900 overflow-hidden">
            {/* Sidebar Navigation */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <TopBar />

                {/* Page Content */}
                <main className="flex-1 overflow-auto bg-blueprint">
                    <Outlet />
                </main>
            </div>

            {/* Global Notifications */}
            <NotificationContainer />
        </div>
    )
}
