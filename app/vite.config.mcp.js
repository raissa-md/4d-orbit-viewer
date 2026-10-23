import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vitePluginImp from "vite-plugin-imp"
import { viteSingleFile } from "vite-plugin-singlefile"

// MCP App build configuration - produces a single HTML file
export default defineConfig({
  base: './',
  plugins: [
    react(),
    vitePluginImp({
      libList: [
        {
          libName: "antd",
          style: (name) => `antd/es/${name}/style`,
        },
      ],
    }),
    viteSingleFile(), // Bundle everything into a single HTML file
  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    alias: [
      { find: /^~/, replacement: "" },
    ],
  },
  build: {
    outDir: 'dist-mcp',
    rollupOptions: {
      input: 'mcp-app.html',
    },
  },
})
