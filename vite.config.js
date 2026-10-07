import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite configuration - AWT Mini Project Phase II
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    open: false
  },
  // Vitest reads its configuration from here, so the tests use the same
  // module resolution and JSX handling as the application itself.
  test: {
    // Node is the default because most of the suite tests pure functions and
    // does not need a DOM. The component and hook tests opt in to jsdom with a
    // `// @vitest-environment jsdom` comment, which keeps the suite fast.
    environment: 'node',
    globals: true,
    setupFiles: './vitest.setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    css: false
  }
})
