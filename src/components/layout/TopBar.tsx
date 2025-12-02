import { useState, useCallback, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Search, User, Wallet, X, LogOut, Settings } from 'lucide-react'
import { useUserStore } from '@stores/userStore'
import { useNotify } from '@stores/uiStore'
import { formatCurrency } from '@utils/formatters'
import { partsCatalog } from '@/data/parts'
import { vehiclesDatabase } from '@/data/vehicles'

export function TopBar() {
    const navigate = useNavigate()
    const notify = useNotify()

    // Selectores optimizados para evitar re-renders innecesarios
    const username = useUserStore((state) => state.user?.username)
    const currency = useUserStore((state) => state.user?.currency)
    const email = useUserStore((state) => state.user?.email)
    const logout = useUserStore((state) => state.logout)

    const isDemoUser = email?.toLowerCase() === 'demo@torres.com'

    // Estados para funcionalidades
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState<Array<{ type: string, name: string, id: string }>>([])
    const [showSearchResults, setShowSearchResults] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    const searchRef = useRef<HTMLDivElement>(null)
    const notifRef = useRef<HTMLDivElement>(null)
    const userRef = useRef<HTMLDivElement>(null)

    // Cerrar dropdowns al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false)
            }
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false)
            }
            if (userRef.current && !userRef.current.contains(e.target as Node)) {
                setShowUserMenu(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Búsqueda en tiempo real
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query)
        if (query.length < 2) {
            setSearchResults([])
            setShowSearchResults(false)
            return
        }

        const lowerQuery = query.toLowerCase()
        const results: Array<{ type: string, name: string, id: string }> = []

        // Buscar en vehículos
        vehiclesDatabase.forEach(v => {
            if (v.name.toLowerCase().includes(lowerQuery) ||
                v.manufacturer.toLowerCase().includes(lowerQuery)) {
                results.push({ type: 'vehicle', name: `${v.manufacturer} ${v.name}`, id: v.id })
            }
        })

        // Buscar en partes (limitar a 5)
        partsCatalog.slice(0, 100).forEach(p => {
            if (results.length >= 8) return
            if (p.name.toLowerCase().includes(lowerQuery) ||
                p.brand.toLowerCase().includes(lowerQuery)) {
                results.push({ type: 'part', name: `${p.brand} ${p.name}`, id: p.id })
            }
        })

        setSearchResults(results.slice(0, 8))
        setShowSearchResults(results.length > 0)
    }, [])

    const handleSearchSelect = useCallback((result: { type: string, name: string, id: string }) => {
        setShowSearchResults(false)
        setSearchQuery('')
        if (result.type === 'vehicle') {
            navigate(`/garage?vehicle=${result.id}`)
        } else {
            navigate(`/catalog?part=${result.id}`)
        }
    }, [navigate])

    const handleLogout = useCallback(() => {
        logout()
        notify.info('Sesión cerrada', 'Has cerrado sesión correctamente')
        navigate('/login')
    }, [logout, notify, navigate])

    // Notificaciones de ejemplo
    const notifications = [
        { id: 1, message: 'Bienvenido a Torres Motorsport', time: 'Ahora', read: false },
        { id: 2, message: 'Tu build ha sido guardado', time: 'Hace 5 min', read: true },
    ]

    return (
        <header className="h-16 bg-torres-dark-800/80 backdrop-blur-sm border-b border-torres-dark-500 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md" ref={searchRef}>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-torres-light-400" />
                    <input
                        type="text"
                        placeholder="Buscar partes, vehículos..."
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
                        className="input pl-10 py-2 text-sm w-full"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-torres-light-400 hover:text-torres-light-100"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}

                    {/* Resultados de búsqueda */}
                    {showSearchResults && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-torres-dark-700 border border-torres-dark-500 rounded-lg shadow-xl z-[9999] max-h-80 overflow-auto">
                            {searchResults.map((result, i) => (
                                <button
                                    key={`${result.type}-${result.id}-${i}`}
                                    onClick={() => handleSearchSelect(result)}
                                    className="w-full px-4 py-3 text-left hover:bg-torres-dark-600 flex items-center gap-3 border-b border-torres-dark-600 last:border-0"
                                >
                                    <span className={`text-xs px-2 py-0.5 rounded ${result.type === 'vehicle' ? 'bg-torres-primary/20 text-torres-primary' : 'bg-torres-secondary/20 text-torres-secondary'}`}>
                                        {result.type === 'vehicle' ? 'Vehículo' : 'Parte'}
                                    </span>
                                    <span className="text-sm text-torres-light-100">{result.name}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
                {/* Currency Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 bg-torres-dark-700 rounded-lg">
                    <Wallet className="w-4 h-4 text-torres-primary" />
                    <span className="font-mono text-sm text-torres-light-100">
                        {isDemoUser ? '∞' : formatCurrency(currency ?? 50000)}
                    </span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-lg hover:bg-torres-dark-700 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-torres-light-300" />
                        {notifications.some(n => !n.read) && (
                            <span className="absolute top-1 right-1 w-2 h-2 bg-torres-secondary rounded-full"></span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-torres-dark-700 border border-torres-dark-500 rounded-lg shadow-xl z-[9999]">
                            <div className="p-3 border-b border-torres-dark-500">
                                <h3 className="font-semibold text-torres-light-100">Notificaciones</h3>
                            </div>
                            <div className="max-h-64 overflow-auto">
                                {notifications.map(n => (
                                    <div key={n.id} className={`p-3 border-b border-torres-dark-600 last:border-0 ${!n.read ? 'bg-torres-primary/5' : ''}`}>
                                        <p className="text-sm text-torres-light-100">{n.message}</p>
                                        <p className="text-xs text-torres-light-400 mt-1">{n.time}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Profile */}
                <div className="relative" ref={userRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-torres-dark-700 transition-colors"
                    >
                        <div className="w-8 h-8 bg-torres-dark-600 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-torres-light-300" />
                        </div>
                        <div className="text-left hidden md:block">
                            <p className="text-sm font-medium text-torres-light-100">
                                {username ?? 'Ingeniero'}
                            </p>
                        </div>
                    </button>

                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-torres-dark-700 border border-torres-dark-500 rounded-lg shadow-xl z-[9999]">
                            <button
                                onClick={() => { navigate('/settings'); setShowUserMenu(false); }}
                                className="w-full px-4 py-3 text-left hover:bg-torres-dark-600 flex items-center gap-3 text-torres-light-100"
                            >
                                <Settings className="w-4 h-4" />
                                <span className="text-sm">Configuración</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="w-full px-4 py-3 text-left hover:bg-torres-dark-600 flex items-center gap-3 text-torres-danger"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="text-sm">Cerrar sesión</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
