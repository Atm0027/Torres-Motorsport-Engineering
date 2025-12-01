import { memo } from 'react'
import { clsx } from 'clsx'

export interface BadgeProps {
    variant?: 'cyan' | 'orange' | 'success' | 'warning' | 'danger' | 'purple'
    size?: 'sm' | 'md'
    children: React.ReactNode
    className?: string
}

export const Badge = memo(function Badge({ variant = 'cyan', size = 'sm', children, className }: BadgeProps) {
    const variants = {
        cyan: 'bg-torres-primary/20 text-torres-primary',
        orange: 'bg-torres-secondary/20 text-torres-secondary',
        success: 'bg-torres-success/20 text-torres-success',
        warning: 'bg-torres-warning/20 text-torres-warning',
        danger: 'bg-torres-danger/20 text-torres-danger',
        purple: 'bg-torres-accent/20 text-torres-accent',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    }

    return (
        <span className={clsx(
            'inline-flex items-center rounded-full font-medium',
            variants[variant],
            sizes[size],
            className
        )}>
            {children}
        </span>
    )
})
