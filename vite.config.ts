import { defineConfig } from "vite";
import { createMpaPlugin } from "vite-plugin-virtual-mpa";
import react from '@vitejs/plugin-react'

export default defineConfig({
  define: {
    global: 'globalThis',
    // 定义全局变量
    'process': process,
  },
  // ...
  plugins: [
    createMpaPlugin({
      htmlMinify: true,
      pages: [
        {
          name: "promise",
          entry: "/pages/promise/index.tsx",
          template: "vite/index.html",
          filename: "promise/index.html",
        },
      ],
      rewrites: [
        {
          from: /^\/demos\/promise/,
          to: `/promise/index.html`,
        },
      ],
    }),
    react(),
  ],

  server: {
    port: 1116,
    open: "/vite/index.html",
    cors: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
