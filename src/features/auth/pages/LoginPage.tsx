import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, LogIn, Car } from 'lucide-react'
import { Button } from '@components/ui/Button'
import { Card } from '@components/ui/Card'
import { useUserStore } from '@stores/userStore'
import { useNotify } from '@stores/uiStore'
import { APP_NAME } from '@/constants'

export function LoginPage() {
    const navigate = useNavigate()
    const { login } = useUserStore()
    const notify = useNotify()

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {}

        if (!formData.email) {
            newErrors.email = 'El email es requerido'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida'
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mínimo 6 caracteres'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 1000))

        const success = login(formData.email, formData.password)

        if (success) {
            notify.success('¡Bienvenido!', 'Has iniciado sesión correctamente')
            navigate('/')
        } else {
            notify.error('Error', 'Credenciales incorrectas')
            setErrors({ password: 'Email o contraseña incorrectos' })
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-torres-dark-900 flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-blueprint opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-torres-primary/5 to-torres-secondary/5"></div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-torres-primary rounded-2xl mb-4">
                        <Car className="w-8 h-8 text-torres-dark-900" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-torres-light-100">
                        {APP_NAME}
                    </h1>
                    <p className="text-torres-light-400 mt-1">
                        Inicia sesión para continuar
                    </p>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-torres-light-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-torres-light-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`input pl-11 ${errors.email ? 'border-torres-danger' : ''}`}
                                    placeholder="tu@email.com"
                                />
                            </div>
                            {errors.email && (
                                <p className="text-torres-danger text-sm mt-1">{errors.email}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-torres-light-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-torres-light-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className={`input pl-11 pr-11 ${errors.password ? 'border-torres-danger' : ''}`}
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-torres-light-400 hover:text-torres-light-100"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-torres-danger text-sm mt-1">{errors.password}</p>
                            )}
                        </div>

                        {/* Forgot Password */}
                        <div className="text-right">
                            <button type="button" className="text-sm text-torres-primary hover:underline">
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                            leftIcon={<LogIn className="w-4 h-4" />}
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-torres-dark-500"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-torres-dark-700 px-4 text-sm text-torres-light-400">
                                ¿No tienes cuenta?
                            </span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <Link to="/register">
                        <Button variant="outline" className="w-full">
                            Crear una cuenta
                        </Button>
                    </Link>
                </Card>

                {/* Demo Account */}
                <p className="text-center text-torres-light-400 text-sm mt-6">
                    Demo: <span className="text-torres-primary">demo@torres.com</span> / <span className="text-torres-primary">demo123</span>
                </p>
            </div>
        </div>
    )
}
