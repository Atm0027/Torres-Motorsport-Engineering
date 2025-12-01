import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg'
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({
        className,
        variant = 'primary',
        size = 'md',
        isLoading,
        leftIcon,
        rightIcon,
        disabled,
        children,
        ...props
    }, ref) => {
        const variants = {
            primary: 'bg-torres-primary text-torres-dark-900 hover:bg-torres-primary/90 hover:shadow-neon-cyan focus:ring-torres-primary',
            secondary: 'bg-torres-dark-600 text-torres-light-100 hover:bg-torres-dark-500 focus:ring-torres-dark-500',
            outline: 'border-2 border-torres-primary text-torres-primary bg-transparent hover:bg-torres-primary/10 focus:ring-torres-primary',
            ghost: 'text-torres-light-300 hover:text-torres-light-100 hover:bg-torres-dark-700 focus:ring-torres-dark-500',
            danger: 'bg-torres-danger text-white hover:bg-torres-danger/90 focus:ring-torres-danger',
        }

        const sizes = {
            sm: 'px-3 py-1.5 text-sm gap-1.5',
            md: 'px-4 py-2 text-sm gap-2',
            lg: 'px-6 py-3 text-base gap-2',
        }

        return (
            <button
                ref={ref}
                className={clsx(
                    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-torres-dark-800',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : leftIcon}
                {children}
                {!isLoading && rightIcon}
            </button>
        )
    }
)

Button.displayName = 'Button'
