import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Configuración optimizada para Cloudflare Pages
export default defineConfig(({ mode }) => ({
    plugins: [
        react({
            jsxRuntime: 'automatic'
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@components': path.resolve(__dirname, './src/components'),
            '@features': path.resolve(__dirname, './src/features'),
            '@hooks': path.resolve(__dirname, './src/hooks'),
            '@stores': path.resolve(__dirname, './src/stores'),
            '@utils': path.resolve(__dirname, './src/utils'),
            '@types': path.resolve(__dirname, './src/types'),
            '@assets': path.resolve(__dirname, './src/assets'),
            '@lib': path.resolve(__dirname, './src/lib')
        }
    },
    server: {
        port: 3001,
        open: true
    },
    preview: {
        port: 3001
    },
    build: {
        outDir: 'dist',
        sourcemap: false,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: mode === 'production',
                drop_debugger: true,
                passes: 2
            },
            mangle: {
                safari10: true
            },
            format: {
                comments: false
            }
        },
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        // React debe ir todo junto para evitar problemas de inicialización
                        if (id.includes('react-dom') || id.includes('/react/') || id.includes('react/') || id.includes('scheduler')) {
                            return 'vendor-react'
                        }

                        if (id.includes('react-router')) return 'vendor-react-router'

                        // Three.js - dividir en chunks separados
                        if (id.includes('@react-three/drei')) return 'vendor-drei'
                        if (id.includes('@react-three/fiber')) return 'vendor-r3f'
                        if (id.includes('three/')) return 'vendor-three'

                        // UI libraries
                        if (id.includes('framer-motion')) return 'vendor-motion'
                        if (id.includes('lucide-react')) return 'vendor-icons'

                        // State
                        if (id.includes('zustand')) return 'vendor-state'
                    }
                    return undefined
                },
                chunkFileNames: 'js/[name]-[hash:8].js',
                entryFileNames: 'js/[name]-[hash:8].js',
                assetFileNames: (assetInfo) => {
                    const name = assetInfo.name || ''
                    if (/\.(png|jpe?g|gif|svg|webp|avif)$/i.test(name)) {
                        return 'img/[name]-[hash:8][extname]'
                    }
                    if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
                        return 'fonts/[name]-[hash:8][extname]'
                    }
                    if (/\.css$/i.test(name)) {
                        return 'css/[name]-[hash:8][extname]'
                    }
                    return 'assets/[name]-[hash:8][extname]'
                }
            }
        },
        // Three.js es inherentemente grande (~655KB), ajustamos el límite
        chunkSizeWarningLimit: 700,
        target: 'esnext',
        cssCodeSplit: true,
        cssMinify: 'lightningcss',
        reportCompressedSize: false, // Más rápido en CI
        assetsInlineLimit: 4096
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'zustand',
            'three',
            '@react-three/fiber',
            '@react-three/drei'
        ]
    },
    esbuild: {
        legalComments: 'none'
    },
    assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr']
}))