import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    target: 'es2019', // transpile to ES2019 for react-snap compatibility
    chunkSizeWarningLimit: 1000, // optional, increase chunk size warning
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) return 'vendor';
        }
      }
    }
  },
  server: {
    historyApiFallback: true, // SPA routing
  },
  define: {
    global: 'window', // required for some dependencies
  }
});
