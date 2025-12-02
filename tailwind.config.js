/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    // Optimización: solo dark mode
    darkMode: 'class',
    // Optimización: desactivar features no usados
    corePlugins: {
        preflight: true,
        // Desactivar plugins que no usamos para reducir CSS
        container: false,
        aspectRatio: false,
        float: false,
        clear: false,
        objectFit: false,
        objectPosition: false,
        overscrollBehavior: false,
        scrollSnapType: false,
        scrollSnapAlign: false,
        scrollSnapStop: false,
        touchAction: false,
        userSelect: false,
        willChange: false,
    },
    // Optimización: modo JIT con safelist para clases dinámicas
    safelist: [
        // Clases que se generan dinámicamente
        { pattern: /bg-torres-(primary|secondary|success|warning|danger)/ },
        { pattern: /text-torres-(primary|secondary|success|warning|danger)/ },
        { pattern: /border-torres-/ },
    ],
    theme: {
        extend: {
            colors: {
                // Torres Motorsport Engineering Brand Colors
                torres: {
                    primary: '#00d4ff',      // Neon cyan - primary accent
                    secondary: '#ff6b35',    // Racing orange
                    accent: '#7c3aed',       // Purple highlight
                    success: '#10b981',      // Green for valid/compatible
                    warning: '#f59e0b',      // Amber for warnings
                    danger: '#ef4444',       // Red for errors/incompatible
                    dark: {
                        900: '#0a0e17',        // Darkest background
                        800: '#0f172a',        // Main background
                        700: '#1e293b',        // Card background
                        600: '#334155',        // Elevated surfaces
                        500: '#475569',        // Borders
                    },
                    light: {
                        100: '#f8fafc',
                        200: '#e2e8f0',
                        300: '#cbd5e1',
                        400: '#94a3b8',
                    }
                },
                // CAD/Blueprint colors
                blueprint: {
                    bg: '#0a1628',
                    grid: '#1a3a5c',
                    line: '#00a8e8',
                    annotation: '#00d4ff',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
                display: ['Orbitron', 'sans-serif'],
            },
            backgroundImage: {
                'carbon-fiber': "url('/textures/carbon-fiber.png')",
                'blueprint-grid': `
          linear-gradient(rgba(0, 168, 232, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 168, 232, 0.1) 1px, transparent 1px)
        `,
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'glow-cyan': 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.15) 0%, transparent 70%)',
            },
            backgroundSize: {
                'blueprint': '50px 50px',
            },
            boxShadow: {
                'neon-cyan': '0 0 20px rgba(0, 212, 255, 0.5)',
                'neon-orange': '0 0 20px rgba(255, 107, 53, 0.5)',
                'neon-purple': '0 0 20px rgba(124, 58, 237, 0.5)',
                'inner-glow': 'inset 0 0 20px rgba(0, 212, 255, 0.1)',
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'fade-in': 'fadeIn 0.2s ease-out',
                'spin-slow': 'spin 8s linear infinite',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(0, 212, 255, 0.5)' },
                    '100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.8)' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
            },
            // Optimización: reducir spacing variants
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
            },
        },
    },
    plugins: [],
    // Optimización para producción
    future: {
        hoverOnlyWhenSupported: true,
        respectDefaultRingColorOpacity: true,
    },
}
