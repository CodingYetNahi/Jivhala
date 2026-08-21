import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export const productionBase = '/Jivhala/'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? productionBase : '/',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['tests/firestore.rules.test.ts'],
  },
}))
