import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./lib/pkg.ts'],
    shims: true,
    clean: true,
    dts: true,
    copy: ['lib/assets'],
    outDir: 'dist-lib',
});
