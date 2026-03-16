// vite.config.ts
import svgr from "vite-plugin-svgr";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from '@tailwindcss/vite'
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: { icon: true },
      }),
      tailwindcss(),
    ],
    server: {
      host: true, // écoute sur 0.0.0.0
      port: 5173,
      allowedHosts: ["compta-staging.artpotentiel.fr", "compta.artpotentiel.fr"], // dev
      proxy: {
        "/directus": {
          target: env.VITE_DIRECTUS_URL || "http://localhost:8055",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/directus/, ""),
        },
      },
    },
    preview: {
      host: true, // écoute sur 0.0.0.0
      port: 4173,
      allowedHosts: ["compta-staging.artpotentiel.fr", "compta.artpotentiel.fr"], // preview
    },
    resolve: {
      alias: {
        "@pages": path.resolve(__dirname, "src/pages/"),
        "@components": path.resolve(__dirname, "src/components/"),
        "@hooks": path.resolve(__dirname, "src/hooks/"),
        "@assets": path.resolve(__dirname, "src/assets"),
        "@graphql": path.resolve(__dirname, "src/graphql/"),
        "@context": path.resolve(__dirname, "src/context/"),
        "@utils": path.resolve(__dirname, "src/utils/"),
        "@styles": path.resolve(__dirname, "src/styles/"),
        "@modules": path.resolve(__dirname, "src/styles/modules/"),
        "@config": path.resolve(__dirname, "src/config/"),
        "@lib": path.resolve(__dirname, "src/lib/"),
        "@/core": path.resolve(__dirname, "src/core/"),
        "@/adapters": path.resolve(__dirname, "src/adapters/"),
      },
    },
  };
});
