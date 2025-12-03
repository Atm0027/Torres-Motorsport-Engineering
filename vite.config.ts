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
                manualChunks: {
                    // Chunks estáticos más predecibles
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
                    'vendor-ui': ['framer-motion', 'lucide-react'],
                    'vendor-state': ['zustand']
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
        chunkSizeWarningLimit: 600,
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