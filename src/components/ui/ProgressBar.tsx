import { memo } from 'react'
import { clsx } from 'clsx'

export interface ProgressBarProps {
    value: number
    max?: number
    variant?: 'cyan' | 'orange' | 'success' | 'warning' | 'danger' | 'gradient'
    size?: 'sm' | 'md' | 'lg'
    showLabel?: boolean
    label?: string
    className?: string
}

// Constantes fuera del componente
const VARIANTS = {
    cyan: 'bg-torres-primary',
    orange: 'bg-torres-secondary',
    success: 'bg-torres-success',
    warning: 'bg-torres-warning',
    danger: 'bg-torres-danger',
    gradient: 'bg-gradient-to-r from-torres-primary to-torres-secondary',
} as const

const SIZES = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
} as const

export const ProgressBar = memo(function ProgressBar({
    value,
    max = 100,
    variant = 'cyan',
    size = 'md',
    showLabel = false,
    label,
    className,
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div className={clsx('w-full', className)}>
            {(showLabel || label) && (
                <div className="flex justify-between mb-1">
                    <span className="text-sm text-torres-light-400">{label}</span>
                    {showLabel && (
                        <span className="text-sm font-mono text-torres-light-300">
                            {percentage | 0}%
                        </span>
                    )}
                </div>
            )}
            <div className={clsx('w-full bg-torres-dark-600 rounded-full overflow-hidden', SIZES[size])}>
                <div
                    className={clsx('h-full rounded-full transition-all duration-500 ease-out', VARIANTS[variant])}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
})

// Stat Bar with glow effect
const GLOW_COLORS = {
    cyan: 'shadow-[0_0_10px_rgba(0,212,255,0.3)]',
    orange: 'shadow-[0_0_10px_rgba(255,107,53,0.3)]',
    success: 'shadow-[0_0_10px_rgba(16,185,129,0.3)]',
    warning: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
    danger: 'shadow-[0_0_10px_rgba(239,68,68,0.3)]',
} as const

const BG_COLORS = {
    cyan: 'bg-torres-primary',
    orange: 'bg-torres-secondary',
    success: 'bg-torres-success',
    warning: 'bg-torres-warning',
    danger: 'bg-torres-danger',
} as const

export const StatBar = memo(function StatBar({
    value,
    max = 100,
    label,
    unit,
    variant = 'cyan',
    className,
}: {
    value: number
    max?: number
    label: string
    unit?: string
    variant?: 'cyan' | 'orange' | 'success' | 'warning' | 'danger'
    className?: string
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    return (
        <div className={clsx('space-y-1', className)}>
            <div className="flex justify-between items-baseline">
                <span className="text-sm text-torres-light-400">{label}</span>
                <span className="font-mono text-sm text-torres-light-100">
                    {value.toLocaleString()}{unit && <span className="text-torres-light-400 ml-1">{unit}</span>}
                </span>
            </div>
            <div className="h-1.5 bg-torres-dark-600 rounded-full overflow-hidden">
                <div
                    className={clsx(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        BG_COLORS[variant],
                        GLOW_COLORS[variant]
                    )}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
})
