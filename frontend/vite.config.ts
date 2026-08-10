import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import legacy from '@vitejs/plugin-legacy';
import { visualizer } from 'rollup-plugin-visualizer';
import viteImagemin from 'vite-plugin-imagemin';
import compress from 'vite-plugin-compress';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'not IE 11'],
    }),
    // Visualizer to analyze bundle size
    visualizer({
      filename: 'stats.html',
      open: false,
      gzipSize: true,
    }),
    // Image optimisation for production builds
    viteImagemin({
      mozjpeg: { quality: 75 },
      optipng: { optimizationLevel: 5 },
      webp: { quality: 75 },
    }),
    // Gzip compression for assets
    compress({ algorithm: 'gzip', ext: '.gz' }),
    // PWA support for faster mobile loading
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: ({ request }) => ['script', 'style', 'image'].includes(request.destination),
            handler: 'CacheFirst',
            options: {
              cacheName: 'assets-cache',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    // Manual code-splitting improves caching on mobile
    rollupOptions: {
      output: {
        manualChunks: {
          reactVendor: ['react', 'react-dom'],
          tailwind: ['tailwindcss'],
        },
      },
    },
    // Target modern mobile browsers
    target: 'es2020',
    // Generate sourcemap only in development
    sourcemap: process.env.NODE_ENV !== 'production',
    // Fast ESBuild minification and drop console/debugger
    minify: 'esbuild',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    // CSS code-splitting for better caching
    cssCodeSplit: true,
  }
})

// Duplicate export removed
