import { useState } from 'react'
import {
    Users,
    Trophy,
    Heart,
    Download,
    Filter,
    Crown,
    Medal,
    Flame,
    Clock
} from 'lucide-react'
import { Card } from '@components/ui/Card'
import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { formatNumber, formatCurrency } from '@utils/formatters'

// Mock community data
const topBuilds = [
    {
        id: '1',
        name: 'GT-R Beast Mode',
        author: 'TurboKing99',
        vehicle: 'Nissan Skyline R34',
        hp: 1150,
        likes: 2847,
        downloads: 1523,
        featured: true,
    },
    {
        id: '2',
        name: 'Supra 2JZ Monster',
        author: 'DriftMaster',
        vehicle: 'Toyota Supra A80',
        hp: 980,
        likes: 1932,
        downloads: 892,
        featured: false,
    },
    {
        id: '3',
        name: 'Evo IX Rally Spec',
        author: 'RallyFan2000',
        vehicle: 'Mitsubishi Lancer Evo IX',
        hp: 650,
        likes: 1456,
        downloads: 678,
        featured: false,
    },
    {
        id: '4',
        name: 'Hellcat Drag Build',
        author: 'AmericanMuscle',
        vehicle: 'Dodge Challenger Hellcat',
        hp: 1200,
        likes: 1289,
        downloads: 543,
        featured: false,
    },
]

const leaderboards = {
    horsepower: [
        { rank: 1, username: 'PowerAddict', value: 1850, vehicle: 'Chevrolet Camaro ZL1' },
        { rank: 2, username: 'TurboKing99', value: 1650, vehicle: 'Nissan Skyline R34' },
        { rank: 3, username: 'BoostMaster', value: 1520, vehicle: 'Toyota Supra A80' },
        { rank: 4, username: 'V8Fanatic', value: 1480, vehicle: 'Ford Mustang GT500' },
        { rank: 5, username: 'JDMLegend', value: 1350, vehicle: 'Mazda RX-7 FD' },
    ],
    acceleration: [
        { rank: 1, username: 'LaunchControl', value: 2.1, vehicle: 'Porsche 911 GT3 RS' },
        { rank: 2, username: 'QuickStarter', value: 2.3, vehicle: 'Mercedes-AMG GT R' },
        { rank: 3, username: 'DragKing', value: 2.5, vehicle: 'Nissan Skyline R34' },
        { rank: 4, username: 'SpeedDemon', value: 2.7, vehicle: 'Toyota Supra A80' },
        { rank: 5, username: 'RocketMan', value: 2.9, vehicle: 'Mitsubishi Lancer Evo IX' },
    ],
}

const events = [
    {
        id: 'e1',
        name: 'Budget Build Challenge',
        description: 'Construye el coche más potente con solo $50,000',
        endDate: '2024-01-15',
        participants: 1247,
        prize: 25000,
    },
    {
        id: 'e2',
        name: 'JDM Legends Week',
        description: 'Solo vehículos japoneses - máxima potencia gana',
        endDate: '2024-01-20',
        participants: 892,
        prize: 50000,
    },
]

export function CommunityPage() {
    const [activeTab, setActiveTab] = useState<'builds' | 'leaderboards' | 'events'>('builds')
    const [leaderboardType, setLeaderboardType] = useState<'horsepower' | 'acceleration'>('horsepower')

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-torres-dark-500 bg-torres-dark-800/50">
                <h1 className="font-display text-2xl font-bold text-torres-light-100 mb-2">
                    Comunidad
                </h1>
                <p className="text-torres-light-400">
                    Explora builds, compite en rankings y participa en eventos
                </p>

                {/* Tabs */}
                <div className="flex gap-2 mt-4">
                    {[
                        { id: 'builds', label: 'Configuraciones', icon: Heart },
                        { id: 'leaderboards', label: 'Clasificaciones', icon: Trophy },
                        { id: 'events', label: 'Eventos', icon: Flame },
                    ].map(tab => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'primary' : 'secondary'}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            leftIcon={<tab.icon className="w-4 h-4" />}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
                {activeTab === 'builds' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                                Builds Destacados
                            </h2>
                            <Button variant="secondary" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
                                Filtrar
                            </Button>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {topBuilds.map(build => (
                                <Card key={build.id} variant="hover" className="p-4">
                                    {/* Build Image Placeholder */}
                                    <div className="h-40 bg-torres-dark-600 rounded-lg mb-4 flex items-center justify-center relative">
                                        {build.featured && (
                                            <Badge variant="warning" className="absolute top-2 left-2">
                                                <Crown className="w-3 h-3 mr-1" />
                                                Destacado
                                            </Badge>
                                        )}
                                        <span className="text-4xl opacity-30">🏎️</span>
                                    </div>

                                    <div className="flex items-start justify-between mb-2">
                                        <div>
                                            <h3 className="font-medium text-torres-light-100">{build.name}</h3>
                                            <p className="text-sm text-torres-light-400">por {build.author}</p>
                                        </div>
                                        <Badge variant="cyan">{formatNumber(build.hp)} CV</Badge>
                                    </div>

                                    <p className="text-sm text-torres-light-400 mb-4">{build.vehicle}</p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-sm text-torres-light-400">
                                            <span className="flex items-center gap-1">
                                                <Heart className="w-4 h-4 text-torres-danger" />
                                                {formatNumber(build.likes)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Download className="w-4 h-4" />
                                                {formatNumber(build.downloads)}
                                            </span>
                                        </div>
                                        <Button size="sm">Ver Build</Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'leaderboards' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Button
                                variant={leaderboardType === 'horsepower' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setLeaderboardType('horsepower')}
                            >
                                Potencia (CV)
                            </Button>
                            <Button
                                variant={leaderboardType === 'acceleration' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setLeaderboardType('acceleration')}
                            >
                                0-100 km/h
                            </Button>
                        </div>

                        <Card className="overflow-hidden">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-torres-dark-500">
                                        <th className="px-4 py-3 text-left text-sm font-display text-torres-light-400">Rank</th>
                                        <th className="px-4 py-3 text-left text-sm font-display text-torres-light-400">Usuario</th>
                                        <th className="px-4 py-3 text-left text-sm font-display text-torres-light-400">Vehículo</th>
                                        <th className="px-4 py-3 text-right text-sm font-display text-torres-light-400">
                                            {leaderboardType === 'horsepower' ? 'Potencia' : 'Tiempo'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboards[leaderboardType].map(entry => (
                                        <tr key={entry.rank} className="border-b border-torres-dark-600 last:border-0">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    {entry.rank === 1 && <Crown className="w-5 h-5 text-amber-400" />}
                                                    {entry.rank === 2 && <Medal className="w-5 h-5 text-gray-400" />}
                                                    {entry.rank === 3 && <Medal className="w-5 h-5 text-amber-700" />}
                                                    {entry.rank > 3 && <span className="text-torres-light-400 w-5 text-center">{entry.rank}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 font-medium text-torres-light-100">{entry.username}</td>
                                            <td className="px-4 py-3 text-torres-light-400">{entry.vehicle}</td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="font-mono text-torres-primary">
                                                    {leaderboardType === 'horsepower'
                                                        ? `${formatNumber(entry.value)} CV`
                                                        : `${entry.value}s`
                                                    }
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </Card>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div className="space-y-4">
                        <h2 className="font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider">
                            Eventos Activos
                        </h2>

                        {events.map(event => (
                            <Card key={event.id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Flame className="w-5 h-5 text-torres-secondary" />
                                            <h3 className="font-display text-lg font-semibold text-torres-light-100">
                                                {event.name}
                                            </h3>
                                            <Badge variant="success">Activo</Badge>
                                        </div>
                                        <p className="text-torres-light-400 mb-4">{event.description}</p>

                                        <div className="flex items-center gap-6 text-sm">
                                            <span className="flex items-center gap-1 text-torres-light-400">
                                                <Users className="w-4 h-4" />
                                                {formatNumber(event.participants)} participantes
                                            </span>
                                            <span className="flex items-center gap-1 text-torres-light-400">
                                                <Clock className="w-4 h-4" />
                                                Termina: {new Date(event.endDate).toLocaleDateString('es-ES')}
                                            </span>
                                            <span className="flex items-center gap-1 text-torres-primary">
                                                <Trophy className="w-4 h-4" />
                                                Premio: {formatCurrency(event.prize)}
                                            </span>
                                        </div>
                                    </div>

                                    <Button>Participar</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
