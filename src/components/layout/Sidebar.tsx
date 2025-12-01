import { NavLink, useLocation } from 'react-router-dom'
import {
    Home,
    Warehouse,
    Package,
    Users,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'
import { APP_SHORT_NAME } from '@/constants'

const navItems = [
    { path: '/', label: 'Inicio', icon: Home },
    { path: '/garage', label: 'Garage', icon: Warehouse },
    { path: '/catalog', label: 'Catálogo', icon: Package },
    { path: '/community', label: 'Comunidad', icon: Users },
    { path: '/settings', label: 'Ajustes', icon: Settings },
]

export function Sidebar() {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()

    // Colapsar automáticamente cuando estamos en el garage
    useEffect(() => {
        if (location.pathname === '/garage') {
            setCollapsed(true)
        }
    }, [location.pathname])

    return (
        <aside
            className={clsx(
                'h-full bg-torres-dark-800 border-r border-torres-dark-500 flex flex-col transition-all duration-300',
                collapsed ? 'w-16' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-center border-b border-torres-dark-500 px-4">
                {collapsed ? (
                    <span className="font-display text-xl font-bold text-torres-primary">T</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-torres-primary rounded-lg flex items-center justify-center">
                            <span className="font-display text-lg font-bold text-torres-dark-900">T</span>
                        </div>
                        <span className="font-display text-sm font-semibold text-torres-light-100 tracking-wider">
                            {APP_SHORT_NAME}
                        </span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) => clsx(
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                            'hover:bg-torres-dark-700',
                            isActive
                                ? 'bg-torres-primary/10 text-torres-primary border border-torres-primary/30'
                                : 'text-torres-light-300 hover:text-torres-light-100'
                        )}
                    >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && (
                            <span className="font-medium truncate">{label}</span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <div className="p-2 border-t border-torres-dark-500">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-torres-light-400 hover:text-torres-light-100 hover:bg-torres-dark-700 transition-colors"
                >
                    {collapsed ? (
                        <ChevronRight className="w-5 h-5" />
                    ) : (
                        <>
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm">Colapsar</span>
                        </>
                    )}
                </button>
            </div>
        </aside>
    )
}
