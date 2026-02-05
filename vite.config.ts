import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom'],
          // Animation library (heavy)
          'vendor-framer': ['framer-motion'],
          // State management
          'vendor-zustand': ['zustand'],
          // Icons library
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
  },
})
