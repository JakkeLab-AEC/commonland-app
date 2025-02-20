import { defineConfig } from "vite";
import { resolve } from 'path';
import { builtinModules } from 'module';
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import copyFilesPlugin from "./vite.plugin.copy";
import truncatePriorBuild from "./vite.plugin.truncate";

import os from 'os';

export default defineConfig({
  base: './',
  build: {
    sourcemap: false,
    outDir: '.vite/',
    emptyOutDir: true,
    minify: 'esbuild',
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
    keepNames: false,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
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
  }, copyFilesPlugin({
    src: os.platform() === "win32" ? 'envs/commonland_python_env_win' : 'envs/commonland_python_env_mac',
    dest: "dist/pythonEnv",
    watch: false
  }), copyFilesPlugin({
    src: "src/mainPython",
    dest: "dist/mainPython"
  })]
});