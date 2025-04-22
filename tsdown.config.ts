import { defineConfig } from 'tsdown';
import artTemplatesPlugin from './plugins/rollup-plugin-art-templates.ts';

export default defineConfig({
    entry: ['./lib/index.ts'],
    minify: true,
    shims: true,
    clean: true,
    plugins: [artTemplatesPlugin()],
});
