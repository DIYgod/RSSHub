import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./lib/index.ts'],
    minify: true,
    shims: true,
    clean: true,
    copy: ['lib/assets'],
    inlineOnly: false,
});
