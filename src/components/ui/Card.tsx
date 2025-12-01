import { forwardRef, type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'hover' | 'glass'
    padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
        const variants = {
            default: 'bg-torres-dark-700/80 backdrop-blur-sm border border-torres-dark-500',
            hover: 'bg-torres-dark-700/80 backdrop-blur-sm border border-torres-dark-500 transition-all duration-300 hover:border-torres-primary/50 hover:shadow-neon-cyan cursor-pointer',
            glass: 'bg-torres-dark-700/50 backdrop-blur-md border border-torres-dark-500/50',
        }

        const paddings = {
            none: '',
            sm: 'p-3',
            md: 'p-4',
            lg: 'p-6',
        }

        return (
            <div
                ref={ref}
                className={clsx(
                    'rounded-xl',
                    variants[variant],
                    paddings[padding],
                    className
                )}
                {...props}
            >
                {children}
            </div>
        )
    }
)

Card.displayName = 'Card'

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={clsx('flex items-center justify-between pb-4 border-b border-torres-dark-500', className)}
            {...props}
        />
    )
)
CardHeader.displayName = 'CardHeader'

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h3
            ref={ref}
            className={clsx('font-display text-lg font-semibold text-torres-light-100 uppercase tracking-wider', className)}
            {...props}
        />
    )
)
CardTitle.displayName = 'CardTitle'

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={clsx('pt-4', className)} {...props} />
    )
)
CardContent.displayName = 'CardContent'
