import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  headers: {
    "Service-Worker-Allowed": "/", // Ensure service worker scope is allowed
  },
  mimeTypes: {
    js: "application/javascript",
  },
  fs: {
    allow: [".."], // Allow serving files from project root
  },
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
        type: "module",
        navigateFallback: "/index.html",
      },
      srcDir: "src",
      outDir: "dist",
      filename: "service-worker.ts", // Explicitly define service worker source
      strategies: "generateSW", // Generate a service worker file
      manifest: {
        name: "Build Your Budget",
        short_name: "BYB",
        description: "Your Budget Buddy",
        start_url: "/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#696360ff",
        icons: [
          {
            src: "/assets/logo.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/logo.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/logo.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        orientation: "portrait",
        scope: "/",
      },
      workbox: {
        swDest: "dist/service-worker.ts", // Explicitly place service worker at root
        globPatterns: ["**/*.{js,jsx,css,html,png,svg,ico}"],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages",
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
            },
          },
          {
            urlPattern: ({ request }) =>
              ["style", "script", "worker"].includes(request.destination),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "assets",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
          {
            urlPattern: ({ request }) => request.destination === "image",
            handler: "CacheFirst",
            options: {
              cacheName: "images",
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
