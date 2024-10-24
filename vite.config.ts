import { defineConfig } from "vite";
import { resolve } from 'path';
import { builtinModules } from 'module';

export default defineConfig({
  base: './',
  build: {
    outDir: '.vite/',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),  // main.ts 파일
        preload: resolve(__dirname, 'src/preload.ts'),
        index: resolve(__dirname, 'index.html'),  // index.html 파일
      },
      external: [
        'electron',
      ],
      output: {
        entryFileNames: '[name].js',
        format: 'cjs',
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});