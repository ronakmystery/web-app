import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    watch: {
      usePolling: true, // Enables polling to detect file changes
    },
    cors: true, 
    allowedHosts: true, 
    headers: {
      "Access-Control-Allow-Origin": "*", //  Ensures CORS works across all origins
    },
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  }
  
});
