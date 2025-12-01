import { Link } from 'react-router-dom'
import {
    Warehouse,
    Package,
    Users,
    Zap,
    ArrowRight,
    Award,
    Car,
    Palette,
    Gauge,
    Settings2
} from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { useUserStore } from '@stores/userStore'
import { formatNumber } from '@utils/formatters'

export function HomePage() {
    // Selectores optimizados para evitar re-renders
    const stats = useUserStore((state) => state.user?.stats)
    const level = useUserStore((state) => state.user?.level ?? 1)
    const experience = useUserStore((state) => state.user?.experience ?? 0)

    const quickStats = [
        { label: 'Potencia Máxima', value: `${formatNumber(stats?.highestHorsepower ?? 0)} CV`, icon: Zap },
        { label: 'Builds Creados', value: formatNumber(stats?.totalBuilds ?? 0), icon: Car },
        { label: 'Partes Instaladas', value: formatNumber(stats?.partsInstalled ?? 0), icon: Package },
        { label: 'Velocidad Máxima', value: `${formatNumber(stats?.bestTopSpeed ?? 0)} km/h`, icon: Gauge },
    ]

    const creatorFeatures = [
        {
            title: 'Crea Tu Coche',
            description: 'Diseña y personaliza tu vehículo desde cero con total libertad',
            icon: Car,
            path: '/garage?section=overview',
            color: 'from-torres-primary to-cyan-600',
            highlight: true,
        },
        {
            title: 'Motor & Potencia',
            description: 'Turbo, admisión, escape, ECU y más para máximo rendimiento',
            icon: Zap,
            path: '/garage?section=engine',
            color: 'from-red-500 to-orange-600',
        },
        {
            title: 'Mecánica & Tuning',
            description: 'Transmisión, suspensión, frenos y ajustes de chasis',
            icon: Settings2,
            path: '/garage?section=drivetrain',
            color: 'from-torres-secondary to-orange-600',
        },
        {
            title: 'Frenos',
            description: 'Discos, pinzas y líneas para máxima frenada',
            icon: Gauge,
            path: '/garage?section=brakes',
            color: 'from-orange-500 to-red-600',
        },
        {
            title: 'Estética',
            description: 'Colores, body kits, llantas y personalización visual',
            icon: Palette,
            path: '/garage?section=exterior',
            color: 'from-pink-500 to-rose-600',
        },
    ]

    const navigationCards = [
        {
            title: 'Mi Garage',
            description: 'Accede a tus vehículos y continúa personalizando',
            icon: Warehouse,
            path: '/garage',
        },
        {
            title: 'Tienda de Partes',
            description: 'Explora cientos de partes de marcas premium',
            icon: Package,
            path: '/catalog',
        },
        {
            title: 'Comunidad',
            description: 'Comparte builds y conecta con otros usuarios',
            icon: Users,
            path: '/community',
        },
    ]

    return (
        <div className="min-h-full p-6 space-y-8">
            {/* Hero Section - Simulador de Creación */}
            <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-torres-dark-800 to-torres-dark-900 border border-torres-dark-500">
                <div className="absolute inset-0 bg-blueprint opacity-30"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-torres-primary/10 to-transparent"></div>

                {/* Decorative car silhouette */}
                <div className="absolute right-8 bottom-0 opacity-10">
                    <svg viewBox="0 0 300 120" className="w-96 h-auto text-torres-primary">
                        <path fill="currentColor" d="M20,80 L50,80 L70,40 L230,40 L250,80 L280,80 L280,100 L20,100 Z" />
                        <circle fill="currentColor" cx="70" cy="100" r="20" />
                        <circle fill="currentColor" cx="230" cy="100" r="20" />
                    </svg>
                </div>

                <div className="relative p-8 md:p-12">
                    <div className="max-w-2xl">
                        <p className="text-torres-primary font-semibold uppercase tracking-widest mb-2 text-sm">
                            Simulador de Personalización
                        </p>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-torres-light-100 mb-4">
                            Crea el Coche<br />
                            <span className="text-neon-cyan">de Tus Sueños</span>
                        </h1>
                        <p className="text-lg text-torres-light-300 mb-8">
                            Diseña, modifica y personaliza tu vehículo con precisión de ingeniero.
                            Cada pieza, cada detalle, bajo tu control total.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link to="/garage">
                                <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                    Empezar a Crear
                                </Button>
                            </Link>
                            <Link to="/catalog">
                                <Button variant="outline" size="lg">
                                    Explorar Partes
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Creator Features - Lo que puedes hacer */}
            <section>
                <h2 className="font-display text-xl font-semibold text-torres-light-100 mb-4 uppercase tracking-wider">
                    Tu Visión, Tu Coche
                </h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {creatorFeatures.map(({ title, description, icon: Icon, path, color, highlight }) => (
                        <Link key={title} to={path}>
                            <Card variant="hover" className={`p-6 h-full group ${highlight ? 'ring-2 ring-torres-primary/50' : ''}`}>
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="font-display text-lg font-semibold text-torres-light-100 mb-2">
                                    {title}
                                </h3>
                                <p className="text-sm text-torres-light-400">
                                    {description}
                                </p>
                                {highlight && (
                                    <p className="text-xs text-torres-primary mt-3 font-semibold">
                                        ★ Función Principal
                                    </p>
                                )}
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Quick Stats */}
            <section>
                <h2 className="font-display text-xl font-semibold text-torres-light-100 mb-4 uppercase tracking-wider">
                    Tu Progreso como Creador
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickStats.map(({ label, value, icon: Icon }) => (
                        <Card key={label} className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-torres-primary/10">
                                    <Icon className="w-5 h-5 text-torres-primary" />
                                </div>
                                <div>
                                    <p className="text-2xl font-display font-bold text-torres-light-100">{value}</p>
                                    <p className="text-sm text-torres-light-400">{label}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {/* Navigation Cards - Acceso Rápido */}
            <section>
                <h2 className="font-display text-xl font-semibold text-torres-light-100 mb-4 uppercase tracking-wider">
                    Acceso Rápido
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                    {navigationCards.map(({ title, description, icon: Icon, path }) => (
                        <Link key={path} to={path}>
                            <Card variant="hover" className="p-5 h-full group">
                                <div className="flex items-center gap-3 mb-2">
                                    <Icon className="w-5 h-5 text-torres-primary group-hover:scale-110 transition-transform" />
                                    <h3 className="font-display font-semibold text-torres-light-100">
                                        {title}
                                    </h3>
                                </div>
                                <p className="text-sm text-torres-light-400">
                                    {description}
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Progress Section */}
            <section className="grid md:grid-cols-2 gap-6">
                {/* Level Progress */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Tu Nivel de Creador
                        </h3>
                        <Award className="w-5 h-5 text-torres-primary" />
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-torres-primary to-torres-accent flex items-center justify-center">
                            <span className="font-display text-2xl font-bold text-white">
                                {level}
                            </span>
                        </div>
                        <div>
                            <p className="text-torres-light-100 font-medium">
                                {level === 1 ? 'Aprendiz' : level < 10 ? 'Mecánico' : level < 25 ? 'Tuner' : 'Maestro'}
                            </p>
                            <p className="text-sm text-torres-light-400">
                                {formatNumber(experience)} XP totales
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-torres-light-400">Progreso al siguiente nivel</span>
                            <span className="text-torres-light-300">65%</span>
                        </div>
                        <div className="h-2 bg-torres-dark-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-torres-primary to-torres-accent rounded-full"
                                style={{ width: '65%' }}
                            />
                        </div>
                    </div>
                </Card>

                {/* Recent Creations */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Tus Últimas Creaciones
                        </h3>
                        <Car className="w-5 h-5 text-torres-success" />
                    </div>

                    <div className="space-y-3">
                        {[
                            { action: 'Motor actualizado', vehicle: 'Nissan Skyline R34', time: 'Hace 2 horas' },
                            { action: 'Configuración guardada', vehicle: 'Toyota Supra A80', time: 'Hace 1 día' },
                            { action: 'Nuevo proyecto', vehicle: 'Mazda RX-7 FD', time: 'Hace 2 días' },
                        ].map((activity, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-torres-dark-600 last:border-0">
                                <div>
                                    <p className="text-torres-light-100 font-medium">{activity.action}</p>
                                    <p className="text-sm text-torres-light-400">{activity.vehicle}</p>
                                </div>
                                <span className="text-xs text-torres-light-400">{activity.time}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>
        </div>
    )
}
