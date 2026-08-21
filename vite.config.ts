import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

function pagesBase(): string {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
  if (!repository || repository.endsWith('.github.io')) return '/'
  return `/${repository}/`
}

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS === 'true' ? pagesBase() : '/',
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    exclude: ['tests/firestore.rules.test.ts'],
  },
})
