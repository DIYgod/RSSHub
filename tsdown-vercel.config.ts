import { defineConfig } from 'tsdown';

import artTemplatesPlugin from './plugins/rollup-plugin-art-templates.ts';

export default defineConfig({
    entry: ['./lib/server.ts'],
    outDir: 'src',
    minify: true,
    shims: true,
    clean: true,
    plugins: [artTemplatesPlugin()],
    // copy: [{ from: 'lib/assets', to: 'dist' }],
});
