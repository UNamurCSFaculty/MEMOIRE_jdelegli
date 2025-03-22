import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import Icons from "unplugin-icons/vite";
import { basePath } from "./basepath.config";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vite.dev/config/
export default defineConfig({
  base: basePath,
  plugins: [react(), tsconfigPaths(), Icons({ compiler: "jsx", jsx: "react" })],
  server: {
    cors: {
      origin: "*",
    },
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    proxy: {
      [`^${basePath}/api/*`]: {
        target: "http://127.0.0.1:8080/",
        changeOrigin: true,
      },
      [`^${basePath}/openapi/*`]: {
        target: "http://127.0.0.1:8080/",
        changeOrigin: true,
      },
      [`^${basePath}/ws/*`]: {
        target: "http://127.0.0.1:8080/",
        changeOrigin: true,
      },
      [`^${basePath}/monitor/*`]: {
        target: "http://127.0.0.1:8080/",
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1024,
  },
});
