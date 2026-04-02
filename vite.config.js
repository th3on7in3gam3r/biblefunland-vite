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
    // Target modern browsers — smaller output
    target: 'es2020',
    // Warn if any chunk exceeds 600kb
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Clerk auth — isolated chunk
          if (id.includes('@clerk')) return 'clerk'
          // React core
          if (id.includes('react-dom') || id.includes('react-router')) return 'react-vendor'
          // Kids Mode pages — keep lightweight and separate
          if (id.includes('/pages/Kids') || id.includes('/pages/kids') ||
              id.includes('KidsDashboard') || id.includes('KidsNumbers') ||
              id.includes('BibleAlphabet') || id.includes('BibleAnimals') ||
              id.includes('BibleCountingWorld') || id.includes('GodsShapes') ||
              id.includes('KidsLetters') || id.includes('KidsShapes') ||
              id.includes('KidsPuzzles') || id.includes('VerseScrambleKids')) {
            return 'kids-mode'
          }
          // Heavy game pages — separate chunk
          if (id.includes('ScriptureRunner') || id.includes('DavidGoliath') ||
              id.includes('ParableEscapeRoom') || id.includes('SpinTheVerse') ||
              id.includes('BibleBattleArena') || id.includes('BibleWordle')) {
            return 'games'
          }
          // AI pages
          if (id.includes('BibleRapGenerator') || id.includes('BibleMiracleArt') ||
              id.includes('BibleCharacterChat') || id.includes('Devotional') ||
              id.includes('SeasonalAI') || id.includes('SermonWriter')) {
            return 'ai-tools'
          }
          // Admin pages — never in main bundle
          if (id.includes('/pages/Admin') || id.includes('AdminAnalytics') ||
              id.includes('LaunchChecklist') || id.includes('ABTestAdmin')) {
            return 'admin'
          }
          // node_modules fallback
          if (id.includes('node_modules')) return 'vendor'
        },
      },
    },
  },
})
