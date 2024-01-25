import { directoryImport } from 'directory-import';
import type { Handler } from 'hono'

type Root = {
  get: (path: string, handler: Handler) => void;
}

const imports = directoryImport({
  targetDirectoryPath: './v3',
  importPattern: /router\.js$/,
});

const routes: Record<string, (root: Root) => void> = {};

for (const path in imports) {
  const name = path.split('/').filter(Boolean)[0];
  routes[name] = imports[path] as (root: Root) => void;
}

export default routes;
