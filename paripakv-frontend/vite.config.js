import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  // Optional for local dev
  server: {
    historyApiFallback: true,
<<<<<<< HEAD
=======
  },
  define: {
    global: "window",
>>>>>>> new-feature
  }
})
