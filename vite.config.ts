import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "https://ysyayla11.github.io/my-react-store-app/",
  plugins: [react()],
});
