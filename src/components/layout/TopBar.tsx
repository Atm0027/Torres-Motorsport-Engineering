import { Bell, Search, User, Wallet } from 'lucide-react'
import { useUserStore } from '@stores/userStore'
import { formatCurrency } from '@utils/formatters'

export function TopBar() {
    // Selectores optimizados para evitar re-renders innecesarios
    const username = useUserStore((state) => state.user?.username)
    const currency = useUserStore((state) => state.user?.currency)
    const level = useUserStore((state) => state.user?.level)
    const email = useUserStore((state) => state.user?.email)

    const isDemoUser = email?.toLowerCase() === 'demo@torres.com'

    return (
        <header className="h-16 bg-torres-dark-800/80 backdrop-blur-sm border-b border-torres-dark-500 flex items-center justify-between px-6">
            {/* Search */}
            <div className="flex-1 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-torres-light-400" />
                    <input
                        type="text"
                        placeholder="Buscar partes, vehículos..."
                        className="input pl-10 py-2 text-sm"
                    />
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
                <button className="relative p-2 rounded-lg hover:bg-torres-dark-700 transition-colors">
                    <Bell className="w-5 h-5 text-torres-light-300" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-torres-secondary rounded-full"></span>
                </button>

                {/* User Profile */}
                <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-torres-dark-700 transition-colors">
                    <div className="w-8 h-8 bg-torres-dark-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-torres-light-300" />
                    </div>
                    <div className="text-left hidden md:block">
                        <p className="text-sm font-medium text-torres-light-100">
                            {username ?? 'Ingeniero'}
                        </p>
                        <p className="text-xs text-torres-light-400">
                            Nivel {level ?? 1}
                        </p>
                    </div>
                </button>
            </div>
        </header>
    )
}
