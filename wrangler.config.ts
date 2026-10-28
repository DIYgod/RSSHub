import { defineWranglerConfig } from 'wrangler/experimental-config';

// Build settings for cf dev, cf build, and cf deploy, which build the Worker with Wrangler
export default defineWranglerConfig({
    build: {
        command: 'pnpm run worker-build',
    },
    findAdditionalModules: true,
    baseDir: 'dist-worker/modules',
    rules: [{ type: 'Data', globs: ['data_files/**'], fallthrough: true }],
    // Unlike wrangler deploy, cf deploy uploads source maps unless this is false
    uploadSourceMaps: false,
    // Serve static assets from lib/assets
    assetsDirectory: 'lib/assets',
});
