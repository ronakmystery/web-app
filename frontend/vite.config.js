import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt', // use 'autoUpdate' if you don't want to prompt
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        cleanupOutdatedCaches: true
      },
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "Mystery",
        short_name: "?",
        start_url: ".",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#000000",
        icons: [
          {
            src: "logo.png",
            sizes: "192x192",
            type: "image/png"
          }
        ]
      }
    })
  ],
  base: "./",
  server: {
    watch: {
      usePolling: true,
    },
    cors: true,
    allowedHosts: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  }
});
