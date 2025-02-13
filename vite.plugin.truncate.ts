import fs from 'fs';
import path from 'path';
import { Plugin } from 'vite';

export default function truncatePriorBuild(folders: string[]): Plugin {
  async function truncateFolders(targetFolders: string[]) {
    const targetPaths: { path: string; isExist: boolean; result: { isDone: boolean; reason: string } }[] = [];

    for (const folderPath of targetFolders) {
      const targetPath = path.resolve(process.cwd(), folderPath);
      const isExist = fs.existsSync(targetPath);

      const result = { isDone: false, reason: "" };
      if (isExist) {
        try {
          await fs.promises.rm(targetPath, { recursive: true, force: true });
          result.isDone = true;
        } catch (error) {
          result.reason = String(error);
        }
      } else {
        result.reason = "Folder does not exist.";
      }

      targetPaths.push({ path: targetPath, isExist, result });
    }

    const isPassed = targetPaths.every(target => target.result.isDone);
    let failedReasonMessage = "";

    if (!isPassed) {
      failedReasonMessage = targetPaths
        .filter(target => !target.result.isDone)
        .map((target, index) => `${index + 1}. Path: ${target.path}, Reason: ${target.result.reason}`)
        .join("\n");
    }

    console.log(`
    -----------------------------------------
    Pre-build work - Truncate prior build.

    Result
    IsPassed : ${isPassed}
    ${isPassed ? "" : failedReasonMessage}
    `);
  }

  return {
    name: 'vite-truncate-prior-build',
    apply: () => true, // serve와 build 모두에 적용

    configResolved(config) {
      // Vite 모드 확인 (serve 또는 build)
      const isBuildMode = config.command === 'build';
      
      // build 모드일 때만 .vite 추가
      const targetFolders = isBuildMode ? [...folders, '.vite'] : folders;
      
      console.log(`Running truncatePriorBuild in ${config.command} mode. Target folders:`, targetFolders);
      
      truncateFolders(targetFolders);
    },

    async configureServer() {
      // 개발 서버 시작 시 이전 빌드 폴더 삭제 (하지만 .vite는 제외)
      await truncateFolders(folders);
    },

    async closeBundle() {
      // 빌드 완료 후 이전 빌드 폴더 삭제 (여기서는 .vite도 포함)
      await truncateFolders([...folders, '.vite']);
    }
  };
}
