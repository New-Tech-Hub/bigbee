import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteImagemin from "vite-plugin-imagemin";
import { imagetools } from 'vite-imagetools';
import { VitePWA } from 'vite-plugin-pwa';
import type { Plugin } from 'vite';

// Removed asyncCSSPlugin - was causing blank pages in production

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      devOptions: {
        enabled: false
      },
      strategies: 'generateSW',
      includeAssets: ['favicon.ico', 'robots.txt', 'hero-bags-collection.jpg'],
      manifest: {
        name: 'Ebeth Boutique & Exclusive Store',
        short_name: 'Ebeth Boutique',
        description: 'Premium fashion, accessories, and fresh groceries at Ebeth Boutique. Where boutique elegance meets everyday convenience.',
        theme_color: '#f7d794',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['shopping', 'lifestyle'],
        screenshots: [
          {
            src: '/hero-bags-collection.jpg',
            sizes: '1920x1080',
            type: 'image/jpeg',
            form_factor: 'wide'
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        skipWaiting: false,
        clientsClaim: false,
        navigationPreload: true,
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,jpeg,svg,webp}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /\.(png|jpg|jpeg|svg|webp|ico|css|js)$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/dgfmfnnzovspmtwnjejr\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'unsplash-images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    }),
    imagetools({
      defaultDirectives: (url) => {
        const pathname = url.pathname;
        // Generate responsive images for hero and category images
        if (pathname.includes('hero-') || pathname.includes('category')) {
          return new URLSearchParams({
            format: 'webp;jpg',
            w: '640;1024;1920',
            as: 'picture'
          });
        }
        // Generate smaller sizes for product thumbnails and logos
        if (pathname.includes('products/') || pathname.includes('logo')) {
          return new URLSearchParams({
            format: 'webp;jpg',
            w: '200;400',
            as: 'picture'
          });
        }
        return new URLSearchParams();
      }
    }),
    mode === "production" && viteImagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [{ name: 'removeViewBox', active: false }]
      },
      webp: { 
        quality: 80,
        lossless: false
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'es2020',
    minify: 'esbuild',
    cssMinify: true,
    cssCodeSplit: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split React and core libraries
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-core';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'react-router';
          }
          // Split Radix UI components
          if (id.includes('node_modules/@radix-ui')) {
            return 'radix-ui';
          }
          // Split Tanstack Query
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }
          // Split Recharts (large charting library)
          if (id.includes('node_modules/recharts')) {
            return 'recharts';
          }
          // Split form libraries
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/@hookform')) {
            return 'forms';
          }
          // Split Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'supabase';
          }
          // Split other large vendors
          if (id.includes('node_modules/')) {
            return 'vendor';
          }
        },
      },
    },
  },
  esbuild: {
    target: 'es2020',
    legalComments: 'none',
    drop: mode === 'production' ? ['debugger'] : [],
  },
}));
