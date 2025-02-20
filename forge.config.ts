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
      ".gitignore",
      "forge.config.ts",
      "postcss.config.js",
      "README.md",
      "style.css",
      "tailwind.config.js",
      "tsconfig.json",
      "vite.config.ts",
      "viteplugin.ts",
      "vite.plugins.own.ts"
    ],
  },
  makers: [
    new MakerSquirrel({authors: 'jakkelab', description: 'IFC File creation app, wrapping IfcOpenShell.'}), 
    new MakerZIP({}, ['darwin'])
  ]
}

export default config;