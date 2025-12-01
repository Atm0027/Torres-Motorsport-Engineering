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
    Settings2,
    Clock
} from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { useUserStore } from '@stores/userStore'
import { useGarageStore } from '@stores/garageStore'
import { formatNumber, formatHorsepower } from '@utils/formatters'

export function HomePage() {
    // Selectores optimizados para evitar re-renders
    const stats = useUserStore((state) => state.user?.stats)
    const savedBuilds = useGarageStore((state) => state.savedBuilds)

    // Obtener el último build para el banner
    const latestBuild = savedBuilds.length > 0 ? savedBuilds[0] : null
    // Obtener los últimos 3 builds para la sección inferior
    const lastThreeBuilds = savedBuilds.slice(0, 3)

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

                    {/* Latest Build - Right Side Full Height */}
                    {latestBuild && (
                        <div className="absolute top-6 bottom-6 right-6 lg:top-8 lg:bottom-8 lg:right-8">
                            <Link to={`/garage?vehicle=${latestBuild.vehicleId}`} className="h-full block">
                                <Card
                                    variant="hover"
                                    className="p-4 bg-torres-dark-700/90 backdrop-blur-sm border-torres-dark-500 hover:border-torres-primary/50 transition-all w-72 h-full flex flex-col"
                                >
                                    <div className="flex items-center gap-2 mb-3">
                                        <Clock className="w-3 h-3 text-torres-primary" />
                                        <span className="text-xs font-semibold text-torres-light-300 uppercase tracking-wider">
                                            Última Creación
                                        </span>
                                    </div>

                                    {/* Image placeholder - fills available space */}
                                    <div className="w-full flex-1 rounded-lg bg-torres-dark-600 flex items-center justify-center overflow-hidden mb-3">
                                        {latestBuild.imageUrl ? (
                                            <img
                                                src={latestBuild.imageUrl}
                                                alt={latestBuild.vehicleName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Car className="w-20 h-20 text-torres-dark-400" />
                                        )}
                                    </div>

                                    {/* Build info */}
                                    <div>
                                        <h4 className="text-base font-semibold text-torres-light-100 truncate">
                                            {latestBuild.vehicleName}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-sm text-torres-primary font-medium">
                                                {formatHorsepower(latestBuild.metrics?.horsepower ?? 0)}
                                            </span>
                                            <span className="text-sm text-torres-light-400">
                                                • {latestBuild.installedParts?.length ?? 0} partes
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        </div>
                    )}
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
                {/* Quick Stats */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Tu Taller
                        </h3>
                        <Award className="w-5 h-5 text-torres-primary" />
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-torres-primary to-torres-accent flex items-center justify-center">
                            <span className="font-display text-2xl font-bold text-white">
                                🔧
                            </span>
                        </div>
                        <div>
                            <p className="text-torres-light-100 font-medium">
                                Tuner Profesional
                            </p>
                            <p className="text-sm text-torres-light-400">
                                {formatNumber(stats?.totalBuilds ?? 0)} builds creados
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-torres-light-400">Partes instaladas</span>
                            <span className="text-torres-light-300">{formatNumber(stats?.partsInstalled ?? 0)}</span>
                        </div>
                        <div className="h-2 bg-torres-dark-600 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-torres-primary to-torres-accent rounded-full"
                                style={{ width: `${Math.min((stats?.partsInstalled ?? 0) / 100 * 100, 100)}%` }}
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
                        {lastThreeBuilds.length > 0 ? (
                            lastThreeBuilds.map((build) => {
                                const savedDate = new Date(build.savedAt)
                                const now = new Date()
                                const diffMs = now.getTime() - savedDate.getTime()
                                const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
                                const diffDays = Math.floor(diffHours / 24)
                                const timeAgo = diffDays > 0
                                    ? `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
                                    : diffHours > 0
                                        ? `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
                                        : 'Hace un momento'

                                return (
                                    <Link
                                        key={build.id}
                                        to={`/garage?vehicle=${build.vehicleId}`}
                                        className="block"
                                    >
                                        <div className="flex items-center justify-between py-2 border-b border-torres-dark-600 last:border-0 hover:bg-torres-dark-700/50 -mx-2 px-2 rounded transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-8 rounded bg-torres-dark-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {build.imageUrl ? (
                                                        <img
                                                            src={build.imageUrl}
                                                            alt={build.vehicleName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <Car className="w-4 h-4 text-torres-dark-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-torres-light-100 font-medium">{build.vehicleName}</p>
                                                    <p className="text-sm text-torres-primary">
                                                        {formatHorsepower(build.metrics?.horsepower ?? 0)} • {build.installedParts?.length ?? 0} partes
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-xs text-torres-light-400">{timeAgo}</span>
                                        </div>
                                    </Link>
                                )
                            })
                        ) : (
                            <div className="text-center py-6">
                                <Car className="w-10 h-10 text-torres-dark-500 mx-auto mb-2" />
                                <p className="text-torres-light-400 text-sm">
                                    Aún no has guardado ningún build
                                </p>
                                <Link to="/garage" className="text-torres-primary text-sm hover:underline mt-1 inline-block">
                                    ¡Crea tu primer coche!
                                </Link>
                            </div>
                        )}
                    </div>
                </Card>
            </section>
        </div>
    )
}
