import { cleanupOutdatedCaches, precacheAndRoute } from "workbox-precaching";

// Precache all assets defined in vite-plugin-pwa's globPatterns
precacheAndRoute(self.__WB_MANIFEST);

// Clean up outdated caches
cleanupOutdatedCaches();

// Listen for messages to skip waiting
self.addEventListener("message", (event: MessageEvent) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
