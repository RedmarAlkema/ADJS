import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    coverage: {
      exclude: [
        'src/main.jsx',
        'src/services/firebase.js',
        'src/test/**',
        'src/**/*.test.{js,jsx}',
      ],
      include: ['src/**/*.{js,jsx}'],
    },
    environment: 'jsdom',
    setupFiles: './src/test/setupTests.js',
  },
})
