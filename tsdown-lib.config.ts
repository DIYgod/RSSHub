import { defineConfig } from 'tsdown';

import artTemplatesPlugin from './plugins/rollup-plugin-art-templates.ts';

export default defineConfig({
    entry: ['./lib/pkg.ts'],
    shims: true,
    clean: true,
    dts: true,
    plugins: [artTemplatesPlugin()],
    copy: ['lib/assets'],
    outDir: 'dist-lib',
});
