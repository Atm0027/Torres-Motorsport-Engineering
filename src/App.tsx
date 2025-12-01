import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@components/layout/MainLayout'
import { useUserStore } from '@stores/userStore'

// Lazy load pages for better code splitting
const GaragePage = lazy(() => import('@features/garage/pages/GaragePage').then(m => ({ default: m.GaragePage })))
const CatalogPage = lazy(() => import('@features/catalog/pages/CatalogPage').then(m => ({ default: m.CatalogPage })))
const CommunityPage = lazy(() => import('@features/community/pages/CommunityPage').then(m => ({ default: m.CommunityPage })))
const SettingsPage = lazy(() => import('@features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const HomePage = lazy(() => import('@features/home/pages/HomePage').then(m => ({ default: m.HomePage })))
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@features/auth/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))

// Loading fallback component
function PageLoader() {
    return (
        <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="animate-spin w-8 h-8 border-4 border-torres-primary border-t-transparent rounded-full" />
        </div>
    )
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
}

// Public Route wrapper (redirect if authenticated)
function PublicRoute({ children }: { children: React.ReactNode }) {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
}

function App() {
    return (
        <Suspense fallback={<PageLoader />}>
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

                {/* Protected Routes */}
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route index element={<HomePage />} />
                    <Route path="garage" element={<GaragePage />} />
                    <Route path="catalog" element={<CatalogPage />} />
                    <Route path="community" element={<CommunityPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                </Route>
            </Routes>
        </Suspense>
    )
}

export default App
