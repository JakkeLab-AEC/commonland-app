import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

interface CopyFilesPluginOptions {
  src: string;  // 복사할 파일/디렉토리 경로
  dest: string; // 복사 대상 경로
  watch?: boolean; // serve 모드에서 파일 변경 감시 여부
}

export default function copyFilesPlugin(options: CopyFilesPluginOptions): Plugin {
  const { src, dest, watch = false } = options;

  if (!src || !dest) {
    throw new Error('src and dest paths are required for the copyFilesPlugin.');
  }

  function copyFiles() {
    const srcPath = path.resolve(process.cwd(), src);
    const destPath = path.resolve(process.cwd(), dest);

    if (!fs.existsSync(srcPath)) {
      throw new Error(`Source path does not exist: ${srcPath}`);
    }

    // 파일 복사
    fs.cpSync(srcPath, destPath, { recursive: true });
    console.log(`Copied files from ${srcPath} to ${destPath}`);
  }

  return {
    name: 'vite-plugin-copy-files',
    apply: () => true, // serve와 build 모두에 적용
    configureServer() {
      // serve 모드에서 동작
      if (watch) {
        // 파일 변경 감시 설정
        const srcPath = path.resolve(process.cwd(), src);
        fs.watch(srcPath, { recursive: true }, (eventType, filename) => {
          console.log(`[serve] Detected ${eventType} in ${filename}. Re-copying files...`);
          copyFiles();
        });
      }
      copyFiles();
    },
    closeBundle() {
      // build 모드에서 동작
      copyFiles();
    },
  };
}