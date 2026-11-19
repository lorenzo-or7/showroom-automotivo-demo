/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const pkg = (names: string) => new RegExp(`node_modules[/\\\\](${names})[/\\\\]`)

export default defineConfig({
  base: '/showroom-automotivo-demo/',
  plugins: [react()],
  build: {
    target: 'es2022',
    rolldownOptions: {
      output: {
        // Bibliotecas em chunks próprios: melhor cache entre deploys do conteúdo
        codeSplitting: {
          groups: [
            { name: 'react', test: pkg('react|react-dom|scheduler') },
            { name: 'router', test: pkg('react-router|react-router-dom') },
            { name: 'motion', test: pkg('motion|framer-motion|motion-dom|motion-utils') },
          ],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: { modules: { classNameStrategy: 'non-scoped' } },
  },
})
