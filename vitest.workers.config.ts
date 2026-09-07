import fs from 'node:fs';
import path from 'node:path';

import { cloudflareTest } from '@cloudflare/vitest-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig, type Plugin } from 'vitest/config';

// Resolve .worker.ts files instead of .ts files, same as tsdown-worker.config.ts
function workerAliasPlugin(): Plugin {
    return {
        name: 'worker-alias',
        enforce: 'pre',
        resolveId(source, importer) {
            // Skip if no importer (entry point) or already a .worker file
            if (!importer || source.includes('.worker')) {
                return null;
            }

            // Handle relative imports
            if (source.startsWith('.')) {
                const importerDir = path.dirname(importer);
                const resolved = path.resolve(importerDir, source);

                for (const ext of ['.worker.ts', '.worker.tsx']) {
                    const workerPath = resolved + ext;
                    if (fs.existsSync(workerPath)) {
                        return workerPath;
                    }
                    const withoutExt = resolved.replace(/\.(ts|tsx)$/, '');
                    const workerPathAlt = withoutExt + ext;
                    if (fs.existsSync(workerPathAlt)) {
                        return workerPathAlt;
                    }
                }
            }

            // Handle @/ alias imports
            if (source.startsWith('@/')) {
                const libPath = path.resolve('./lib', source.slice(2));

                for (const ext of ['.worker.ts', '.worker.tsx']) {
                    const workerPath = libPath + ext;
                    if (fs.existsSync(workerPath)) {
                        return workerPath;
                    }
                }
            }

            return null;
        },
    };
}

export default defineConfig({
    plugins: [
        cloudflareTest({
            miniflare: {
                compatibilityDate: '2026-09-01',
                compatibilityFlags: ['global_fetch_strictly_public'],
                kvNamespaces: ['CACHE'],
                modulesRules: [{ type: 'CompiledWasm', include: ['**/*.wasm'] }],
            },
        }),
        workerAliasPlugin(),
        tsconfigPaths({ root: '.' }),
    ],
    resolve: {
        alias: {
            'dotenv/config': path.resolve('./lib/shims/dotenv-config.ts'),
        },
    },
    test: {
        include: ['lib/**/*.worker.test.ts', 'tests/**/*.worker.test.ts', 'lib/utils/parse-script-data.test.ts', 'lib/utils/parse-date-in-timezone.test.ts', 'tests/source-date-routes.test.ts', 'tests/cache-coordination.test.ts'],
    },
});
