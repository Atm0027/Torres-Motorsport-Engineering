import { clsx } from 'clsx'
import { useMemo } from 'react'

export interface GaugeProps {
    value: number
    max: number
    min?: number
    label?: string
    unit?: string
    size?: 'sm' | 'md' | 'lg'
    variant?: 'cyan' | 'orange' | 'gradient'
    showValue?: boolean
    className?: string
}

export function Gauge({
    value,
    max,
    min = 0,
    label,
    unit,
    size = 'md',
    variant = 'cyan',
    showValue = true,
    className,
}: GaugeProps) {
    const percentage = ((value - min) / (max - min)) * 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100)

    const sizes = {
        sm: { size: 80, stroke: 6 },
        md: { size: 120, stroke: 8 },
        lg: { size: 160, stroke: 10 },
    }

    const { size: svgSize, stroke } = sizes[size]
    const radius = (svgSize - stroke) / 2
    const circumference = radius * Math.PI * 2
    const arc = circumference * 0.75 // 270 degrees
    const dashOffset = arc - (arc * clampedPercentage) / 100

    // Memoizar el ID del gradiente para evitar regenerarlo en cada render
    const gradientId = useMemo(() => `gauge-gradient-${Math.random().toString(36).substr(2, 9)}`, [])

    return (
        <div className={clsx('flex flex-col items-center', className)}>
            <div className="relative" style={{ width: svgSize, height: svgSize }}>
                <svg
                    width={svgSize}
                    height={svgSize}
                    viewBox={`0 0 ${svgSize} ${svgSize}`}
                    className="transform rotate-[135deg]"
                >
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00d4ff" />
                            <stop offset="100%" stopColor="#ff6b35" />
                        </linearGradient>
                    </defs>

                    {/* Background arc */}
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={stroke}
                        strokeDasharray={`${arc} ${circumference}`}
                        className="text-torres-dark-600"
                        strokeLinecap="round"
                    />

                    {/* Value arc */}
                    <circle
                        cx={svgSize / 2}
                        cy={svgSize / 2}
                        r={radius}
                        fill="none"
                        stroke={variant === 'gradient' ? `url(#${gradientId})` : variant === 'cyan' ? '#00d4ff' : '#ff6b35'}
                        strokeWidth={stroke}
                        strokeDasharray={`${arc} ${circumference}`}
                        strokeDashoffset={dashOffset}
                        strokeLinecap="round"
                        className="transition-all duration-500 ease-out"
                        style={{
                            filter: `drop-shadow(0 0 6px ${variant === 'orange' ? 'rgba(255, 107, 53, 0.5)' : 'rgba(0, 212, 255, 0.5)'})`,
                        }}
                    />
                </svg>

                {/* Center content */}
                {showValue && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={clsx(
                            'font-display font-bold text-torres-light-100',
                            size === 'sm' && 'text-lg',
                            size === 'md' && 'text-2xl',
                            size === 'lg' && 'text-3xl'
                        )}>
                            {value.toLocaleString()}
                        </span>
                        {unit && (
                            <span className="text-xs text-torres-light-400 uppercase tracking-wider">
                                {unit}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {label && (
                <span className="mt-2 text-sm text-torres-light-400 uppercase tracking-wider">
                    {label}
                </span>
            )}
        </div>
    )
}

// Mini Gauge for inline stats
export function MiniGauge({
    value,
    max,
    variant = 'cyan',
    className,
}: {
    value: number
    max: number
    variant?: 'cyan' | 'orange' | 'success'
    className?: string
}) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

    const colors = {
        cyan: '#00d4ff',
        orange: '#ff6b35',
        success: '#10b981',
    }

    return (
        <div className={clsx('relative w-8 h-8', className)}>
            <svg width="32" height="32" viewBox="0 0 32 32">
                <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-torres-dark-600"
                />
                <circle
                    cx="16"
                    cy="16"
                    r="14"
                    fill="none"
                    stroke={colors[variant]}
                    strokeWidth="3"
                    strokeDasharray={`${(percentage / 100) * 88} 88`}
                    strokeLinecap="round"
                    transform="rotate(-90 16 16)"
                    className="transition-all duration-300"
                />
            </svg>
        </div>
    )
}
