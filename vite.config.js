import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer', // don't block first paint
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'robots.txt'],
      manifest: {
        name: 'EZDoc - Emergency Medical Assistance',
        short_name: 'EZDoc',
        description: 'One-tap SOS with GPS, live ambulance tracking and doctor booking for rural areas.',
        theme_color: '#DC2626',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell: every built JS/CSS/HTML file is precached (cache-first),
        // and client-side routes fall back to index.html when offline.
        globPatterns: ['**/*.{js,css,html,svg,png,txt}'],
        navigateFallback: '/index.html',
        runtimeCaching: [
          {
            // Live SOS status: always try the network, fall back to the last known status
            urlPattern: /\/api\/request\/[^/]+$/,
            handler: 'NetworkFirst',
            options: { cacheName: 'sos-status', networkTimeoutSeconds: 5, expiration: { maxEntries: 20 } },
          },
          {
            // Doctor list: answer instantly from cache, refresh in the background
            urlPattern: /\/api\/doctors$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-doctors', expiration: { maxEntries: 1, maxAgeSeconds: 7 * 24 * 3600 } },
          },
          {
            // Map tiles rarely change; keep the ones the user has seen
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 300, maxAgeSeconds: 7 * 24 * 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
    // `ANALYZE=1 npm run build` writes dist/stats.html (bundle treemap)
    process.env.ANALYZE && visualizer({ filename: 'dist/stats.html', gzipSize: true }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}', 'ezdoc-backend/**/*.test.js'],
    env: { VITE_API_BASE: 'http://api.test/api', VITE_SOCKET_URL: 'http://api.test' },
  },
  build: {
    rollupOptions: {
      output: {
        // Keep React + router in their own long-cached chunk; app code changes more often
        manualChunks(id) {
          if (/node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react-vendor'
        },
      },
    },
  },
})
