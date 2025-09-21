import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://ec2-15-236-90-18.eu-west-3.compute.amazonaws.com:8000",
        changeOrigin: true,
      },
    },
  },
});
