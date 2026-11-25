import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import type { TsdownPlugin } from 'tsdown';
import { defineConfig } from 'tsdown';

// Plugin to automatically resolve .worker.ts files instead of .ts files
function workerAliasPlugin(): TsdownPlugin {
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

const cifrante = createRequire(path.resolve('node_modules/teleproto/package.json')).resolve('cifrante');
const oxcParserWasm = createRequire(createRequire(path.resolve('package.json')).resolve('oxc-parser/package.json')).resolve('@oxc-parser/binding-wasm32-wasip1/wasm.wasm');

// Wrangler uploads dist-worker as it is, one module per chunk (`no_bundle` in the Wrangler configs).
// Bundling every chunk again into one script made the Worker compile all routes at startup, which
// went over the startup CPU limit. So every import in the output must resolve to a file in
// dist-worker: these WebAssembly imports are copied there (see `copy`) and imported by relative path.
const vendorModules: Array<{ matches: (source: string) => boolean; id: string }> = [
    { matches: (source) => source === 'xxhash-wasm', id: './vendor/xxhash-wasm/xxhash-wasm.js' },
    { matches: (source) => source === '@oxc-parser/binding-wasm32-wasip1/wasm.wasm', id: `./vendor/${path.basename(oxcParserWasm)}` },
    { matches: (source) => source.endsWith('/simplecc_wasm_bg.wasm'), id: './vendor/simplecc_wasm_bg.wasm' },
];

function vendorModulesPlugin(): TsdownPlugin {
    return {
        name: 'worker-vendor-modules',
        resolveId(source) {
            const vendorModule = vendorModules.find(({ matches }) => matches(source));
            return vendorModule ? { id: vendorModule.id, external: true } : null;
        },
    };
}

export default defineConfig({
    entry: ['./lib/worker.ts'],
    outDir: 'dist-worker',
    format: 'esm',
    dts: false,
    minify: true,
    clean: true,
    platform: 'node',
    target: 'esnext',
    treeshake: true,
    copy: [
        { from: 'node_modules/header-generator/data_files', to: 'dist-worker' },
        // xxhash-wasm's workerd export, which imports its WebAssembly from the same directory
        { from: ['node_modules/xxhash-wasm/workerd/xxhash-wasm.js', 'node_modules/xxhash-wasm/workerd/xxhash.wasm'], to: 'dist-worker/vendor/xxhash-wasm' },
        { from: [oxcParserWasm, 'node_modules/simplecc-wasm/pkg/web/simplecc_wasm_bg.wasm'], to: 'dist-worker/vendor' },
    ],
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
        'process.env.VERCEL_ENV': JSON.stringify(''),
        'import.meta.dirname': JSON.stringify('/worker'),
        'import.meta.url': JSON.stringify('file:///worker/index.mjs'),
        // CommonJS compatibility
        __dirname: JSON.stringify('/bundle'),
        __filename: JSON.stringify('/worker/index.mjs'),
    },
    plugins: [vendorModulesPlugin(), workerAliasPlugin()],
    alias: {
        // External dependencies that need Worker-compatible replacements
        'node:module': path.resolve('./lib/shims/node-module.ts'),
        'dotenv/config': path.resolve('./lib/shims/dotenv-config.ts'),
        '@sentry/node': path.resolve('./lib/shims/sentry-node.ts'),
        '@honeybadger-io/js': path.resolve('./lib/shims/honeybadger.ts'),
        typescript: path.resolve('./lib/shims/typescript.ts'),
        jsdom: path.resolve('./lib/shims/jsdom.ts'),
        'pac-proxy-agent': path.resolve('./lib/shims/pac-proxy-agent.ts'),
        'simplecc-wasm': path.resolve('./lib/shims/simplecc-wasm.ts'),
        cifrante: path.join(path.dirname(cifrante), 'cifrante.mjs'),
        // Routes file with Worker-specific build (match relative import from lib/)
        '../assets/build/routes.js': path.resolve('./assets/build/routes-worker.js'),
        // routes.json is only used in test environment, but rolldown still tries to resolve it
        '../assets/build/routes.json': path.resolve('./assets/build/routes-worker.js'),
    },
    deps: {
        onlyBundle: false,
        neverBundle: [
            // Exclude non-code files that might be accidentally imported
            /\/_README$/,
            /\.node$/,
        ],
        alwaysBundle: [/.*/],
    },
});
