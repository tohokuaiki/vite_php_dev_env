import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';
import * as glob from 'glob';
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { NotFoundPlugin } from "./vite/NotFoundPlugin";
import { CacheBusting } from "./vite/CacheBusting";

type FileSet = Record<string, string>;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildIgnore = {
  html: [
    "src/public/**/*.html",
  ],
  scss: [
    "src/public/**/*.scss", "src/scss/**/_*.scss"
  ]
}

const reduceFileMap = (accumulator: FileSet, file: string): FileSet => {
  const filePath = path.relative('src', file).replace(/\\/g, '/');
  const key = filePath.slice(0, filePath.lastIndexOf('.'));
  accumulator[key] = path.resolve(__dirname, file);
  return accumulator;
}

const html = glob.sync('src/**/*.html',
  { ignore: buildIgnore.html }).reduce(reduceFileMap, {});
const scss = glob.sync('src/scss/**/*.scss',
  { ignore: buildIgnore.scss }).reduce(reduceFileMap, {});

const cacheRegexps: RegExp[] = [
  new RegExp('(<script .+src="/js/main.js)("></script>)'),
  new RegExp('(<link .+href="/js/main.js)(">)'),
  new RegExp('(<link .+href="/css/styles.css)(">)'),
];


// https://vite.dev/config/
export default defineConfig({
  root: path.resolve(__dirname, 'src'),
  envDir: '../',
  plugins: [react(), ViteEjsPlugin(), NotFoundPlugin(), CacheBusting(cacheRegexps)],
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: false,
    assetsInlineLimit: 0,
    rollupOptions: {
      input: { ...html, ...scss },
      output:
      {
        entryFileNames: 'js/[name].js',
        chunkFileNames: `js/[name].js`,
        assetFileNames: ({ name }) => `${name?.replace('scss/', 'css/')}`,
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 一時的にbootstrap内警告を黙らせるため。
        silenceDeprecations: ['mixed-decls', 'color-functions', 'global-builtin', 'import']
      },
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8080
  }
})
