import { lazy, Suspense, memo, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
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

// Preload critical pages after initial render
const preloadCriticalPages = () => {
    // Preload garage (most used page) and home after a short delay
    setTimeout(() => {
        import('@features/garage/pages/GaragePage')
        import('@features/home/pages/HomePage')
    }, 1000)
}

// Loading fallback component - memoized
const PageLoader = memo(() => (
    <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="animate-spin w-8 h-8 border-4 border-torres-primary border-t-transparent rounded-full" />
    </div>
))
PageLoader.displayName = 'PageLoader'

// Protected Route wrapper - memoized
const ProtectedRoute = memo(({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return <>{children}</>
})
ProtectedRoute.displayName = 'ProtectedRoute'

// Public Route wrapper - memoized
const PublicRoute = memo(({ children }: { children: React.ReactNode }) => {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated)

    if (isAuthenticated) {
        return <Navigate to="/" replace />
    }

    return <>{children}</>
})
PublicRoute.displayName = 'PublicRoute'

// Route change listener for preloading
function RoutePreloader() {
    const location = useLocation()

    useEffect(() => {
        // Preload adjacent pages based on current route
        switch (location.pathname) {
            case '/':
                import('@features/garage/pages/GaragePage')
                break
            case '/garage':
                import('@features/catalog/pages/CatalogPage')
                break
            case '/catalog':
                import('@features/garage/pages/GaragePage')
                break
        }
    }, [location.pathname])

    return null
}

function App() {
    // Preload critical pages after mount
    useEffect(() => {
        preloadCriticalPages()
    }, [])

    return (
        <Suspense fallback={<PageLoader />}>
            <RoutePreloader />
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
