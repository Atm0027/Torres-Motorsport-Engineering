import { useEffect, useState } from 'react'
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Trophy } from 'lucide-react'
import { clsx } from 'clsx'
import { useUIStore } from '@stores/uiStore'
import type { Notification } from '@/types'

export function NotificationContainer() {
    const { notifications, removeNotification } = useUIStore()

    return (
        <div className="fixed top-20 right-4 z-50 flex flex-col gap-2 max-w-sm">
            {notifications.map((notification) => (
                <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onClose={() => removeNotification(notification.id)}
                />
            ))}
        </div>
    )
}

function NotificationItem({
    notification,
    onClose,
}: {
    notification: Notification
    onClose: () => void
}) {
    const [isExiting, setIsExiting] = useState(false)

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        warning: AlertTriangle,
        info: Info,
        achievement: Trophy,
    }

    const colors = {
        success: 'border-torres-success/50 bg-torres-success/10',
        error: 'border-torres-danger/50 bg-torres-danger/10',
        warning: 'border-torres-warning/50 bg-torres-warning/10',
        info: 'border-torres-primary/50 bg-torres-primary/10',
        achievement: 'border-amber-500/50 bg-amber-500/10',
    }

    const iconColors = {
        success: 'text-torres-success',
        error: 'text-torres-danger',
        warning: 'text-torres-warning',
        info: 'text-torres-primary',
        achievement: 'text-amber-500',
    }

    const Icon = icons[notification.type]

    useEffect(() => {
        if (notification.duration && notification.duration > 0) {
            const timer = setTimeout(() => {
                setIsExiting(true)
                setTimeout(onClose, 200)
            }, notification.duration)

            return () => clearTimeout(timer)
        }
    }, [notification.duration, onClose])

    const handleClose = () => {
        setIsExiting(true)
        setTimeout(onClose, 200)
    }

    return (
        <div
            className={clsx(
                'flex items-start gap-3 p-4 rounded-lg border backdrop-blur-sm shadow-lg',
                'transition-all duration-200',
                colors[notification.type],
                isExiting ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0 animate-slide-up'
            )}
        >
            <Icon className={clsx('w-5 h-5 flex-shrink-0 mt-0.5', iconColors[notification.type])} />

            <div className="flex-1 min-w-0">
                <p className="font-medium text-torres-light-100">{notification.title}</p>
                <p className="text-sm text-torres-light-400 mt-0.5">{notification.message}</p>

                {notification.action && (
                    <button
                        onClick={notification.action.onClick}
                        className="text-sm font-medium text-torres-primary hover:text-torres-primary/80 mt-2"
                    >
                        {notification.action.label}
                    </button>
                )}
            </div>

            <button
                onClick={handleClose}
                className="p-1 rounded hover:bg-torres-dark-600 transition-colors"
            >
                <X className="w-4 h-4 text-torres-light-400" />
            </button>
        </div>
    )
}
