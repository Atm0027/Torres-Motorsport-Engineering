import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Configuración optimizada para Cloudflare Pages
export default defineConfig({
    plugins: [
        react({
            // Optimización: usar el nuevo JSX transform
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
        minify: 'terser', // Terser para mejor compresión en producción
        terserOptions: {
            compress: {
                drop_console: true,      // Eliminar console.log
                drop_debugger: true,     // Eliminar debugger
                pure_funcs: ['console.log', 'console.info', 'console.debug'],
                passes: 2                // Más pasadas = mejor compresión
            },
            mangle: {
                safari10: true           // Compatibilidad Safari
            },
            format: {
                comments: false          // Sin comentarios
            }
        },
        rollupOptions: {
            output: {
                // Code splitting agresivo para Cloudflare CDN
                manualChunks: (id) => {
                    // Separar node_modules en chunks por librería
                    if (id.includes('node_modules')) {
                        // React core - se carga siempre
                        if (id.includes('react-dom')) return 'vendor-react-dom'
                        if (id.includes('react-router')) return 'vendor-router'
                        if (id.includes('/react/')) return 'vendor-react'

                        // Three.js - chunk separado (grande, lazy load)
                        if (id.includes('three') || id.includes('@react-three')) {
                            if (id.includes('drei')) return 'vendor-drei'
                            if (id.includes('fiber')) return 'vendor-fiber'
                            return 'vendor-three'
                        }

                        // UI libraries
                        if (id.includes('framer-motion')) return 'vendor-motion'
                        if (id.includes('lucide')) return 'vendor-icons'

                        // Estado
                        if (id.includes('zustand')) return 'vendor-state'

                        // Resto de vendors
                        return 'vendor-misc'
                    }

                    // Features como chunks separados
                    if (id.includes('/features/garage/')) return 'feature-garage'
                    if (id.includes('/features/catalog/')) return 'feature-catalog'
                    if (id.includes('/features/community/')) return 'feature-community'
                    if (id.includes('/features/settings/')) return 'feature-settings'
                    if (id.includes('/features/auth/')) return 'feature-auth'

                    // Componentes 3D como chunk separado
                    if (id.includes('/vehicle/') && id.includes('3D')) return 'component-3d'
                },
                // Hashes cortos para URLs más limpias en CDN
                chunkFileNames: 'js/[name]-[hash:8].js',
                entryFileNames: 'js/[name]-[hash:8].js',
                assetFileNames: (assetInfo) => {
                    // Organizar assets por tipo
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
            },
            // Treeshaking agresivo
            treeshake: {
                moduleSideEffects: false,
                propertyReadSideEffects: false
            }
        },
        chunkSizeWarningLimit: 500,  // Reducido para mejor performance
        target: 'esnext',
        cssCodeSplit: true,
        cssMinify: 'lightningcss',   // CSS minifier más rápido
        reportCompressedSize: true,  // Ver tamaños gzip
        assetsInlineLimit: 4096      // Inline assets < 4KB
    },
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'react-router-dom',
            'zustand'
        ],
        // Three.js se carga lazy, no pre-bundlear
        exclude: ['@react-three/postprocessing']
    },
    esbuild: {
        legalComments: 'none',
        treeShaking: true,
        drop: ['console', 'debugger']  // Eliminar console/debugger via esbuild
    },
    assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr'],

    // Optimización: definir constantes en build time
    define: {
        __DEV__: JSON.stringify(false)
    }
})