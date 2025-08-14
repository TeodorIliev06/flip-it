import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      "Content-Security-Policy":
        "script-src 'self' 'unsafe-inline' https://accounts.google.com https://apis.google.com; " +
        "frame-src 'self' https://accounts.google.com; " +
        "connect-src 'self' https://accounts.google.com https://localhost:7299",
      "Referrer-Policy": "no-referrer-when-downgrade",
    },
  },
});
