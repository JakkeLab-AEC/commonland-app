import { defineConfig } from "vite";
import { resolve } from 'path';
import { builtinModules } from 'module';
import { mkdirSync, readFileSync, writeFileSync } from "fs";

export default defineConfig({
  base: './',
  build: {
    outDir: '.vite/',
    minify: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/main.ts'),  // main.ts 파일
        preload: resolve(__dirname, 'src/preload.ts'),
        index: resolve(__dirname, 'index.html'),  // index.html 파일
      },
      external: [
        'electron',
        ...builtinModules,
      ],
      output: {
        entryFileNames: '[name].js',
        format: 'es',
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
  assetsInclude: ['**/*.json'],
  json: {
    stringify: true,
  },
  esbuild: {
    keepNames: true,  // Preserve original function and class names
    minifyIdentifiers: false,  // Don't minify variable names
    minifySyntax: false,  // Don't modify syntax for optimization
    minifyWhitespace: false,  // Preserve whitespace and formatting
  },
  plugins: [{
    name: 'copy-font-file',
    writeBundle() {
      // Ensure the directory exists
      mkdirSync('.vite/src/fontjson', { recursive: true });
      
      // Copy the font file to maintain the same path structure
      const fontContent = readFileSync('src/fontjson/font_default.json');
      writeFileSync('.vite/src/fontjson/font_default.json', fontContent);
    }
  }]
});