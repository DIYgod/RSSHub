import { defineWranglerConfig } from 'wrangler/experimental-config';

// Build settings for cf dev, cf build, and cf deploy, which build the Worker with Wrangler
export default defineWranglerConfig({
    build: {
        command: 'pnpm run worker-build',
    },
    // Upload each chunk of dist-worker as its own module instead of bundling them into one script, so
    // that the Worker does not compile every route at startup. tsdown already bundles all dependencies.
    noBundle: true,
    findAdditionalModules: true,
    baseDir: 'dist-worker',
    rules: [
        { type: 'ESModule', globs: ['**/*.mjs', 'vendor/**/*.js'] },
        { type: 'CompiledWasm', globs: ['**/*.wasm'] },
        { type: 'Data', globs: ['data_files/**'] },
    ],
    // Unlike wrangler deploy, cf deploy uploads source maps unless this is false
    uploadSourceMaps: false,
    // Serve static assets from lib/assets
    assetsDirectory: 'lib/assets',
});
