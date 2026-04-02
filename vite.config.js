import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Gracefully handle dev server being down
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.warn('⚠️ Vite Proxy: Backend (3001) not reachable at:', err.address);
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Backend unreachable during development' }));
            }
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            // If the backend returns 404/500, we can log it here if needed
          });
        },
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          'clerk-auth': ['@clerk/clerk-react', '@clerk/types'],
          'router': ['react-router-dom'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
