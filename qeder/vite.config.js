import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Qeder-App/', // GitHub Pages serves from a subpath — must match your repo name exactly
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'favicon.ico',
        'apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/icon-maskable-512.png'
      ],
      manifest: {
        id: '/',
        name: 'Qeder — Daily Spiritual Check-In',
        short_name: 'Qeder',
        description:
          'A calm, private, offline-first daily check-in that reflects your heart and offers a matched Dua or Quranic verse. 100% on-device, no account required.',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        display_override: ['standalone', 'window-controls-overlay'],
        orientation: 'portrait',
        start_url: '/Qeder-App/',
        scope: '/Qeder-App/',
        lang: 'en',
        dir: 'ltr',
        categories: ['lifestyle', 'health', 'religion'],
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        shortcuts: [
          {
            name: "Today's Check-In",
            short_name: 'Check-In',
            description: 'Start your 5-question spiritual check-in',
            url: '/Qeder-App/?shortcut=checkin',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Journal',
            short_name: 'Journal',
            description: 'View your bookmarked Duas and streak',
            url: '/Qeder-App/?shortcut=journal',
            icons: [{ src: 'icons/icon-192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        // Note: audio recitations from cdn.islamic.network are intentionally
        // NOT intercepted by the service worker. Workbox's CacheFirst
        // strategy doesn't stream partial/range requests well, which made
        // playback slow or stuck once the SW took control (i.e. after
        // install). Audio is left to the browser's native network handling
        // instead — fast and reliable, at the cost of offline playback.
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'qeder-google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'qeder-google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
  server: {
    host: true,
    port: 5173
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
