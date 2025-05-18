import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://myapp.lvh.me:3000",
        changeOrigin: false,
      },
    },
    host: "myapp.lvh.me",
    strictPort: true,
    hmr: {
      host: "myapp.lvh.me",
    },
    watch: {
      usePolling: true,
    },
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    allowedHosts: [".myapp.lvh.me"],
  },
});
