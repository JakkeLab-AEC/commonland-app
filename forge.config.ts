import { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';
import { MakerZIP } from '@electron-forge/maker-zip';

const config: ForgeConfig = {
  packagerConfig: {
    asar: false,
    overwrite: true,
    prune: true,
    ignore: [
      "^/src",
      "^/envs",
      "^/.vscode",
      "^/.run",
      "^/.idea",
      "^/static",
      "^/doc",
      ".gitignore",
      "forge.config.ts",
      "jest.config.ts",
      "miniconda_environment.yaml",
      "postcss.config.js",
      "README.md",
      "style.css",
      "tailwind.config.js",
      "tsconfig.json",
      "vite.config.ts",
      "vite.plugin.copy.ts",
      "vite.plugin.truncate.ts",
      
    ],
    icon: './assets/icons/appicon'
  },
  makers: [
    new MakerSquirrel({authors: 'jakkelab', description: 'An editor app for managing topography.'}), 
    new MakerZIP({}, ['darwin'])
  ],
}

export default config;