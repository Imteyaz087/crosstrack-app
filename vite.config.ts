/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'robots.txt', 'og-image.png'],
      manifest: {
        name: 'TRACKVOLT — Hybrid Athlete OS',
        short_name: 'TRACKVOLT',
        description: 'The all-in-one CrossFit & hybrid athlete tracker. Log WODs, track PRs, manage nutrition, sync training with your cycle — all offline-first.',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'en',
        dir: 'ltr',
        categories: ['fitness', 'health', 'sports', 'lifestyle'],
        prefer_related_applications: false,
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        shortcuts: [
          {
            name: 'Log Workout',
            short_name: 'Log',
            description: 'Quickly log today\'s workout',
            url: '/?tab=log',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'WOD Timer',
            short_name: 'Timer',
            description: 'Start AMRAP, EMOM, or For Time timer',
            url: '/?tab=timer',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          },
          {
            name: 'Track Nutrition',
            short_name: 'Eat',
            description: 'Log meals and track macros',
            url: '/?tab=eat',
            icons: [{ src: '/icon-192.png', sizes: '192x192' }]
          }
        ],
        screenshots: [
          {
            src: '/screenshots/today-dashboard.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Your daily dashboard — streak, recovery, workout, nutrition at a glance'
          },
          {
            src: '/screenshots/workout-log.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Log any WOD in seconds — AMRAP, EMOM, For Time, Strength'
          },
          {
            src: '/screenshots/nutrition-macros.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Track macros with visual progress bars and meal logging'
          },
          {
            src: '/screenshots/progress-prs.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Watch your PRs grow with charts and personal records'
          },
          {
            src: '/screenshots/cycle-training.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Train smarter with menstrual cycle sync'
          },
          {
            src: '/screenshots/achievements.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Unlock 50+ achievements and celebrate milestones'
          },
          {
            src: '/screenshots/offline-first.png',
            sizes: '1290x2796',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Works offline — every feature available without internet'
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /\/api\/nutrition-search/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'trackvolt-nutrition-api', expiration: { maxEntries: 200, maxAgeSeconds: 604800 } }
          },
          {
            urlPattern: /\/api\/barcode-lookup/i,
            handler: 'NetworkFirst',
            options: { cacheName: 'trackvolt-barcode-api', expiration: { maxEntries: 300, maxAgeSeconds: 2592000 } }
          }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Stable vendor chunk — rarely changes, long-cached
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler'))
              return 'vendor-react'
            if (id.includes('dexie'))
              return 'vendor-dexie'
            if (id.includes('i18next') || id.includes('react-i18next'))
              return 'vendor-i18n'
            if (id.includes('zustand'))
              return 'vendor-zustand'
            if (id.includes('lucide-react'))
              return 'vendor-icons'
          }
        },
      },
    },
  },
  resolve: {
    alias: { '@': '/src' }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  }
})
