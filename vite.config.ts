import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'tween': ['@tweenjs/tween.js'],
          'cubejs': ['cubejs']
        }
      }
    }
  },
  server: {
    port: 5173,
    open: true
  }
});

