import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: ['./lib/container.ts'],
    outDir: 'dist-container',
    format: 'esm',
    minify: true,
    clean: true,
    platform: 'node',
    target: 'esnext',
    treeshake: true,
    define: {
        'process.env.NODE_ENV': JSON.stringify('production'),
    },
    external: ['@cloudflare/containers'],
});
