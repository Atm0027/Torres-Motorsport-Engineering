import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    User,
    Palette,
    Volume2,
    Bell,
    LogOut,
    Moon,
    Sun,
    Monitor,
    Save,
    RotateCcw
} from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { useUserStore } from '@stores/userStore'
import { useUIStore, useNotify } from '@stores/uiStore'

export function SettingsPage() {
    const navigate = useNavigate()
    
    // Selectores individuales para evitar re-renders
    const user = useUserStore((state) => state.user)
    const logout = useUserStore((state) => state.logout)
    const theme = useUIStore((state) => state.theme)
    const setTheme = useUIStore((state) => state.setTheme)
    const notify = useNotify()

    const [settings, setSettings] = useState({
        username: user?.username ?? 'Ingeniero',
        email: user?.email ?? '',
        soundEnabled: true,
        musicEnabled: true,
        notificationsEnabled: true,
        autoSave: true,
        units: 'metric',
        language: 'es',
    })

    const handleSave = useCallback(() => {
        notify.success('Guardado', 'Configuración guardada correctamente')
    }, [notify])

    const handleReset = useCallback(() => {
        notify.info('Restablecido', 'Configuración restablecida a valores por defecto')
    }, [notify])

    const handleLogout = useCallback(() => {
        logout()
        notify.info('Sesión cerrada', 'Has cerrado sesión correctamente')
        navigate('/login')
    }, [logout, notify, navigate])

    return (
        <div className="h-full overflow-auto">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <div>
                    <h1 className="font-display text-2xl font-bold text-torres-light-100 mb-2">
                        Configuración
                    </h1>
                    <p className="text-torres-light-400">
                        Personaliza tu experiencia en Torres Motorsport Engineering
                    </p>
                </div>

                {/* Profile Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <User className="w-5 h-5 text-torres-primary" />
                        <h2 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Perfil
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-torres-light-400 mb-2">
                                Nombre de usuario
                            </label>
                            <input
                                type="text"
                                value={settings.username}
                                onChange={(e) => setSettings({ ...settings, username: e.target.value })}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-torres-light-400 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={settings.email}
                                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                                className="input"
                            />
                        </div>
                    </div>
                </Card>

                {/* Appearance Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Palette className="w-5 h-5 text-torres-primary" />
                        <h2 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Apariencia
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-torres-light-400 mb-3">
                                Tema
                            </label>
                            <div className="flex gap-3">
                                {[
                                    { id: 'dark', label: 'Oscuro', icon: Moon },
                                    { id: 'blueprint', label: 'Blueprint', icon: Monitor },
                                    { id: 'racing', label: 'Racing', icon: Sun },
                                ].map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id as 'dark' | 'blueprint' | 'racing')}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${theme === t.id
                                            ? 'bg-torres-primary/20 border-torres-primary text-torres-primary'
                                            : 'bg-torres-dark-700 border-torres-dark-500 text-torres-light-300 hover:border-torres-light-400'
                                            }`}
                                    >
                                        <t.icon className="w-4 h-4" />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-torres-light-400 mb-2">
                                Sistema de unidades
                            </label>
                            <select
                                value={settings.units}
                                onChange={(e) => setSettings({ ...settings, units: e.target.value })}
                                className="input w-48"
                            >
                                <option value="metric">Métrico (km/h, kg)</option>
                                <option value="imperial">Imperial (mph, lb)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-torres-light-400 mb-2">
                                Idioma
                            </label>
                            <select
                                value={settings.language}
                                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                                className="input w-48"
                            >
                                <option value="es">Español</option>
                                <option value="en">English</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Audio Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Volume2 className="w-5 h-5 text-torres-primary" />
                        <h2 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Audio
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between">
                            <span className="text-torres-light-300">Efectos de sonido</span>
                            <input
                                type="checkbox"
                                checked={settings.soundEnabled}
                                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                                className="w-5 h-5 rounded bg-torres-dark-600 border-torres-dark-500 text-torres-primary focus:ring-torres-primary"
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <span className="text-torres-light-300">Música de fondo</span>
                            <input
                                type="checkbox"
                                checked={settings.musicEnabled}
                                onChange={(e) => setSettings({ ...settings, musicEnabled: e.target.checked })}
                                className="w-5 h-5 rounded bg-torres-dark-600 border-torres-dark-500 text-torres-primary focus:ring-torres-primary"
                            />
                        </label>
                    </div>
                </Card>

                {/* Notifications Section */}
                <Card className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-5 h-5 text-torres-primary" />
                        <h2 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Notificaciones
                        </h2>
                    </div>

                    <div className="space-y-4">
                        <label className="flex items-center justify-between">
                            <span className="text-torres-light-300">Notificaciones push</span>
                            <input
                                type="checkbox"
                                checked={settings.notificationsEnabled}
                                onChange={(e) => setSettings({ ...settings, notificationsEnabled: e.target.checked })}
                                className="w-5 h-5 rounded bg-torres-dark-600 border-torres-dark-500 text-torres-primary focus:ring-torres-primary"
                            />
                        </label>

                        <label className="flex items-center justify-between">
                            <span className="text-torres-light-300">Guardado automático</span>
                            <input
                                type="checkbox"
                                checked={settings.autoSave}
                                onChange={(e) => setSettings({ ...settings, autoSave: e.target.checked })}
                                className="w-5 h-5 rounded bg-torres-dark-600 border-torres-dark-500 text-torres-primary focus:ring-torres-primary"
                            />
                        </label>
                    </div>
                </Card>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4">
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                        leftIcon={<LogOut className="w-4 h-4" />}
                    >
                        Cerrar Sesión
                    </Button>

                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleReset}
                            leftIcon={<RotateCcw className="w-4 h-4" />}
                        >
                            Restablecer
                        </Button>
                        <Button
                            onClick={handleSave}
                            leftIcon={<Save className="w-4 h-4" />}
                        >
                            Guardar Cambios
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
