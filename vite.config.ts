import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
            workbox: {
                // Optimización: solo precache de recursos críticos
                globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
                // Excluir chunks grandes del precache
                globIgnores: ['**/vendor-three*.js', '**/parts-catalog*.js'],
                // Cache de modelos GLB
                runtimeCaching: [
                    {
                        // Cache de chunks grandes (Three.js, parts-catalog)
                        urlPattern: /vendor-three.*\.js$|parts-catalog.*\.js$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'large-chunks',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 7 // 7 días
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /\.glb$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'glb-models',
                            expiration: {
                                maxEntries: 20,
                                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 días
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.googleapis\.com/,
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'google-fonts-stylesheets'
                        }
                    },
                    {
                        urlPattern: /^https:\/\/fonts\.gstatic\.com/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'google-fonts-webfonts',
                            expiration: {
                                maxEntries: 10,
                                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 año
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            manifest: {
                name: 'Torres Motorsport Engineering',
                short_name: 'Torres MSE',
                description: 'Advanced vehicle modification simulator with engineering precision',
                theme_color: '#0f172a',
                background_color: '#0f172a',
                display: 'standalone',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ]
            }
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
        port: 3000,
        open: true
    },
    build: {
        outDir: 'dist',
        sourcemap: false, // Desactivar sourcemaps en producción para reducir tamaño
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
                pure_funcs: ['console.log', 'console.info']
            }
        },
        rollupOptions: {
            output: {
                // Optimización: separar chunks por tipo
                manualChunks: (id) => {
                    // Vendor chunks
                    if (id.includes('node_modules')) {
                        if (id.includes('react-dom') || id.includes('react-router')) {
                            return 'vendor-react'
                        }
                        if (id.includes('three') || id.includes('@react-three')) {
                            return 'vendor-three'
                        }
                        if (id.includes('zustand')) {
                            return 'vendor-state'
                        }
                        if (id.includes('framer-motion') || id.includes('lucide-react')) {
                            return 'vendor-ui'
                        }
                    }
                    // Parts catalog como chunk separado (lazy load)
                    if (id.includes('/data/parts.ts') || id.includes('/data/partsIndex.ts')) {
                        return 'parts-catalog'
                    }
                    return undefined
                },
                // Optimización: nombres de chunks más eficientes
                chunkFileNames: 'assets/[name]-[hash:8].js',
                entryFileNames: 'assets/[name]-[hash:8].js',
                assetFileNames: 'assets/[name]-[hash:8].[ext]'
            }
        },
        // Optimización: aumentar límite de warning pero mantener chunks pequeños
        chunkSizeWarningLimit: 600,
        // Optimización: target moderno para mejor rendimiento
        target: 'esnext',
        // Optimización: CSS code splitting
        cssCodeSplit: true
    },
    // Optimización: mejor rendimiento en desarrollo
    optimizeDeps: {
        include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'zustand'],
        exclude: ['@react-three/postprocessing']
    },
    // Optimización: esbuild para TypeScript más rápido
    esbuild: {
        legalComments: 'none',
        treeShaking: true
    }
})
