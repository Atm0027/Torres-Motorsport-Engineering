import { memo, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'
import { Badge } from '@components/ui/Badge'
import type { Vehicle, PartCategory } from '@/types'
import type { LucideIcon } from 'lucide-react'

interface GarageSection {
    id: string
    name: string
    icon: LucideIcon
    description: string
    color: string
    categories: PartCategory[]
}

interface SectionNavProps {
    sections: Record<string, GarageSection>
    activeSection: string
    currentVehicle: Vehicle | null
    onSectionChange: (sectionId: string) => void
}

export const SectionNav = memo(function SectionNav({
    sections,
    activeSection,
    currentVehicle,
    onSectionChange
}: SectionNavProps) {
    const getInstalledCount = useCallback((categories: PartCategory[]) => {
        if (!categories.length || !currentVehicle) return 0
        return currentVehicle.installedParts.filter(ip =>
            categories.includes(ip.part.category)
        ).length
    }, [currentVehicle])

    return (
        <div className="flex-1 overflow-auto p-4">
            <h3 className="font-display text-sm font-semibold text-torres-light-100 uppercase tracking-wider mb-3">
                Secciones
            </h3>
            <nav className="space-y-2">
                {Object.entries(sections).map(([key, section]) => {
                    const Icon = section.icon
                    const isActive = activeSection === key
                    const installedCount = getInstalledCount(section.categories)

                    return (
                        <button
                            key={key}
                            onClick={() => onSectionChange(key)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${isActive
                                ? 'bg-gradient-to-r ' + section.color + ' text-white shadow-lg'
                                : 'text-torres-light-300 hover:bg-torres-dark-700 hover:text-torres-light-100'
                                }`}
                        >
                            <div className={`p-2 rounded-lg flex-shrink-0 ${isActive ? 'bg-white/20' : 'bg-torres-dark-600'}`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                                <p className="text-sm font-medium">{section.name}</p>
                                <p className={`text-xs ${isActive ? 'text-white/70' : 'text-torres-light-400'}`}>
                                    {section.description}
                                </p>
                            </div>
                            {installedCount > 0 && (
                                <Badge variant="cyan" size="sm" className="flex-shrink-0">
                                    {installedCount}
                                </Badge>
                            )}
                            <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-torres-light-500'}`} />
                        </button>
                    )
                })}
            </nav>
        </div>
    )
})
