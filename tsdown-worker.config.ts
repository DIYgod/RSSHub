import fs from 'node:fs';
import path from 'node:path';

import type { Plugin } from 'rolldown';
import { defineConfig } from 'tsdown';

// Plugin to automatically resolve .worker.ts files instead of .ts files
function workerAliasPlugin(): Plugin {
    return {
        name: 'worker-alias',
        resolveId(source, importer) {
            // Skip if no importer (entry point) or already a .worker file
            if (!importer || source.includes('.worker')) {
                return null;
            }

            // Handle relative imports
            if (source.startsWith('.')) {
                const importerDir = path.dirname(importer);
                const resolved = path.resolve(importerDir, source);

                // Try .worker.ts and .worker.tsx variants
                for (const ext of ['.worker.ts', '.worker.tsx']) {
                    const workerPath = resolved + ext;
                    if (fs.existsSync(workerPath)) {
                        return workerPath;
                    }
                    // Also check if source already has extension
                    const withoutExt = resolved.replace(/\.(ts|tsx)$/, '');
                    const workerPathAlt = withoutExt + ext;
                    if (fs.existsSync(workerPathAlt)) {
                        return workerPathAlt;
                    }
                }
            }

            // Handle @/ alias imports
            if (source.startsWith('@/')) {
                const relativePath = source.slice(2); // Remove @/
                const libPath = path.resolve('./lib', relativePath);

                // Try .worker.ts and .worker.tsx variants
                for (const ext of ['.worker.ts', '.worker.tsx']) {
                    const workerPath = libPath + ext;
                    if (fs.existsSync(workerPath)) {
                        return workerPath;
                    }
                    // Handle directory imports (e.g., @/utils/cache -> @/utils/cache/index.worker.ts)
                    const indexWorkerPath = path.join(libPath, 'index') + ext;
                    if (fs.existsSync(indexWorkerPath)) {
                        return indexWorkerPath;
                    }
                }
            }

            return null;
        },
    };
}

export default defineConfig({
    entry: ['./lib/worker.ts'],
    outDir: 'dist-worker',
    format: 'esm',
    minify: true,
    clean: true,
    platform: 'node',
    target: 'esnext',
    treeshake: true,
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.VERCEL_ENV': JSON.stringify(''),
        'import.meta.dirname': JSON.stringify('/worker'),
        'import.meta.url': JSON.stringify('file:///worker/index.mjs'),
        // CommonJS compatibility
        __dirname: JSON.stringify('/worker'),
        __filename: JSON.stringify('/worker/index.mjs'),
    },
    external: [
        // Exclude non-code files that might be accidentally imported
        /\/_README$/,
        /\.node$/,
    ],
    noExternal: [/.*/],
    plugins: [workerAliasPlugin()],
    alias: {
        // External dependencies that need Worker-compatible replacements
        'node:module': path.resolve('./lib/shims/node-module.ts'),
        'dotenv/config': path.resolve('./lib/shims/dotenv-config.ts'),
        '@sentry/node': path.resolve('./lib/shims/sentry-node.ts'),
        'xxhash-wasm': path.resolve('./lib/shims/xxhash-wasm.ts'),
        // Routes file with Worker-specific build (match relative import from lib/)
        '../assets/build/routes.js': path.resolve('./assets/build/routes-worker.js'),
        // routes.json is only used in test environment, but rolldown still tries to resolve it
        '../assets/build/routes.json': path.resolve('./assets/build/routes-worker.js'),
    },
});
