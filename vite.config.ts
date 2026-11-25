import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { cabecalhosDeSeguranca } from "./securityHeaders";

const indexHtml = path.resolve(__dirname, "index.html");

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Cabeçalhos de segurança no servidor de desenvolvimento.
    headers: cabecalhosDeSeguranca({ dev: true, indexHtml }),
  },
  preview: {
    // `npm run preview` serve o build: CSP sem 'unsafe-inline' em scripts.
    headers: cabecalhosDeSeguranca({ dev: false, indexHtml }),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
