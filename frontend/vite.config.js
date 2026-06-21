import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        index: 'index.html',
        levels: 'levels.html',
        game: 'game.html',
        about: 'about.html',
      },
    },
  },
  server: {
    port: 5173,
  },
})
