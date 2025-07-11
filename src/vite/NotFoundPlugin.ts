import { type Plugin, type ResolvedConfig } from 'vite';
import * as path from 'path';
import fs from 'fs';
import url from 'url';

export function NotFoundPlugin(): Plugin {
  let viteConfig: ResolvedConfig;

  return {
    name: 'not-found-handler',

    configResolved(config) {
      viteConfig = config; // Vite の設定を取得
    },

    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) {
          return next();
        }
        const parsedUrl = url.parse(req.url).pathname || '';
        if (
          parsedUrl.startsWith('/@') ||
          parsedUrl.startsWith('/src') ||
          // parsedUrl.startsWith('/node_modules') ||
          parsedUrl.startsWith('/vite/')
        ) {
          return next();
        }
        // プロジェクトルートと public/ を考慮してファイルの実在をチェック
        const rootDir = viteConfig.root || process.cwd(); // Vite の `root` を取得
        const publicDir = path.resolve(rootDir, viteConfig.publicDir || 'public');
        const publicPath = decodeURIComponent(path.join(publicDir, parsedUrl));
        const rootPath = decodeURIComponent(path.join(rootDir, parsedUrl));

        if (!fs.existsSync(publicPath) && !fs.existsSync(rootPath)) {
          res.statusCode = 404;
          res.end('404 Not Found');
          return;
        }
        next();
      });
    },
  };
}
