import { defineConfig } from 'tsdown';
import artTemplatesPlugin from './plugins/rollup-plugin-art-templates';

export default defineConfig({
    entry: ['./lib/index.ts'],
    minify: true,
    plugins: [artTemplatesPlugin()],
});
