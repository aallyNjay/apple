import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 개발 서버(5173)에서 /api 요청은 Spring Boot(8080)로 프록시.
// 브라우저는 항상 5173 한 곳으로만 요청하므로 CORS 설정이 필요 없다.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
});
