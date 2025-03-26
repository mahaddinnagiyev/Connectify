import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dotenv from "dotenv";
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env.SERVER_USER_URL": JSON.stringify(process.env.SERVER_USER_URL),
    "process.env.VITE_SERVER_WEBSOCKET_URL": JSON.stringify(process.env.VITE_SERVER_WEBSOCKET_URL),
    "process.env.GOOGLE_CLIENT_REDIRECT_URL": JSON.stringify(
      process.env.GOOGLE_CLIENT_REDIRECT_URL
    ),
    "process.env.VAPID_PUBLIC_KEY": JSON.stringify(
      process.env.VAPID_PUBLIC_KEY
    ),
  },
});
