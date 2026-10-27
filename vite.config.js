import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // `ANALYZE=1 npm run build` writes dist/stats.html (bundle treemap)
    process.env.ANALYZE && visualizer({ filename: 'dist/stats.html', gzipSize: true }),
  ],
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
