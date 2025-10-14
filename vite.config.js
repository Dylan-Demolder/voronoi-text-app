import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Set base to your canonical public URL so production builds use absolute asset paths.
// Change this to the domain you control if you want a different host.
const BASE = process.env.VITE_BASE || 'https://voronoi-text-app.vercel.app/'

export default defineConfig({
  plugins: [react()],
  base: BASE,
})
