import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
    plugins: [react()],
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
        minify: 'esbuild', // Usar esbuild en lugar de terser (más rápido)
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-three': ['three', '@react-three/fiber', '@react-three/drei'],
                    'vendor-state': ['zustand'],
                    'vendor-ui': ['framer-motion', 'lucide-react']
                },
                chunkFileNames: 'assets/[name]-[hash:8].js',
                entryFileNames: 'assets/[name]-[hash:8].js',
                assetFileNames: 'assets/[name]-[hash:8].[ext]'
            }
        },
        chunkSizeWarningLimit: 600,
        target: 'esnext',
        cssCodeSplit: true
    },
    optimizeDeps: {
        include: ['react', 'react-dom', 'three', '@react-three/fiber', '@react-three/drei', 'zustand'],
        exclude: ['@react-three/postprocessing']
    },
    esbuild: {
        legalComments: 'none'
    },
    assetsInclude: ['**/*.glb', '**/*.gltf']
})
