import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base is set to '/andy/' to match the GitHub Pages URL
// at https://refactorlab.github.io/andy/
export default defineConfig({
  base: '/andy/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
