/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GRAPHQL_ENDPOINT: string;
  readonly [key: string]: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@components": path.resolve(__dirname, "src/components"),
    },
  },
});