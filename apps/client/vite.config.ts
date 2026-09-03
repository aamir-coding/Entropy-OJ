import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: {
          'monaco-vendor': ['@monaco-editor/react'],
          'markdown-math': ['react-markdown', 'remark-gfm', 'remark-math', 'rehype-katex', 'katex'],
          'ui-vendor': ['lucide-react', 'react-resizable-panels'],
        },
      },
    },
  },
});
