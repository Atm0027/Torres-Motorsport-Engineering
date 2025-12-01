import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, UserPlus, Car, CheckCircle } from 'lucide-react'
import { Button } from '@components/ui/Button'
import { Card } from '@components/ui/Card'
import { useUserStore } from '@stores/userStore'
import { useNotify } from '@stores/uiStore'
import { APP_NAME } from '@/constants'

export function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useUserStore()
    const notify = useNotify()

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<{
        username?: string
        email?: string
        password?: string
        confirmPassword?: string
    }>({})

    const passwordRequirements = [
        { label: 'Mínimo 6 caracteres', met: formData.password.length >= 6 },
        { label: 'Al menos una letra', met: /[a-zA-Z]/.test(formData.password) },
        { label: 'Al menos un número', met: /\d/.test(formData.password) },
    ]

    const validateForm = () => {
        const newErrors: typeof errors = {}

        if (!formData.username) {
            newErrors.username = 'El nombre de usuario es requerido'
        } else if (formData.username.length < 3) {
            newErrors.username = 'Mínimo 3 caracteres'
        } else if (formData.username.length > 20) {
            newErrors.username = 'Máximo 20 caracteres'
        }

        if (!formData.email) {
            newErrors.email = 'El email es requerido'
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email inválido'
        }

        if (!formData.password) {
            newErrors.password = 'La contraseña es requerida'
        } else if (!passwordRequirements.every(r => r.met)) {
            newErrors.password = 'La contraseña no cumple los requisitos'
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirma tu contraseña'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Las contraseñas no coinciden'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)

        // Simular delay de registro
        await new Promise(resolve => setTimeout(resolve, 1500))

        const success = register(formData.username, formData.email, formData.password)

        if (success) {
            notify.success('¡Cuenta creada!', 'Bienvenido a Torres Motorsport Engineering')
            navigate('/')
        } else {
            notify.error('Error', 'No se pudo crear la cuenta')
            setErrors({ email: 'Este email ya está registrado' })
        }

        setIsLoading(false)
    }

    return (
        <div className="min-h-screen bg-torres-dark-900 flex items-center justify-center p-4">
            {/* Background */}
            <div className="absolute inset-0 bg-blueprint opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-torres-secondary/5 to-torres-primary/5"></div>

            <div className="relative w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-torres-primary rounded-2xl mb-4">
                        <Car className="w-8 h-8 text-torres-dark-900" />
                    </div>
                    <h1 className="font-display text-2xl font-bold text-torres-light-100">
                        Únete a {APP_NAME}
                    </h1>
                    <p className="text-torres-light-400 mt-1">
                        Crea tu cuenta y empieza a diseñar
                    </p>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-torres-light-300 mb-2">
                                Nombre de usuario
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-torres-light-400" />
                                <input
                                    type="text"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    className={`input pl-11 ${errors.username ? 'border-torres-danger' : ''}`}
                                    placeholder="TuNombre"
                                />
                            </div>
                            {errors.username && (
                                <p className="text-torres-danger text-sm mt-1">{errors.username}</p>
                            )}
                        </div>

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

                            {/* Password Requirements */}
                            <div className="mt-2 space-y-1">
                                {passwordRequirements.map((req, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs">
                                        <CheckCircle className={`w-3 h-3 ${req.met ? 'text-torres-success' : 'text-torres-dark-500'}`} />
                                        <span className={req.met ? 'text-torres-success' : 'text-torres-light-400'}>
                                            {req.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-torres-light-300 mb-2">
                                Confirmar Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-torres-light-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className={`input pl-11 ${errors.confirmPassword ? 'border-torres-danger' : ''}`}
                                    placeholder="••••••••"
                                />
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-torres-danger text-sm mt-1">{errors.confirmPassword}</p>
                            )}
                        </div>

                        {/* Submit */}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                            leftIcon={<UserPlus className="w-4 h-4" />}
                        >
                            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                        </Button>
                    </form>

                    {/* Terms */}
                    <p className="text-center text-torres-light-400 text-xs mt-4">
                        Al crear una cuenta, aceptas los{' '}
                        <button className="text-torres-primary hover:underline">Términos de Servicio</button>
                        {' '}y la{' '}
                        <button className="text-torres-primary hover:underline">Política de Privacidad</button>
                    </p>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-torres-dark-500"></div>
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-torres-dark-700 px-4 text-sm text-torres-light-400">
                                ¿Ya tienes cuenta?
                            </span>
                        </div>
                    </div>

                    {/* Login Link */}
                    <Link to="/login">
                        <Button variant="outline" className="w-full">
                            Iniciar Sesión
                        </Button>
                    </Link>
                </Card>
            </div>
        </div>
    )
}
