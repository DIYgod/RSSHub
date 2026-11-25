import { defineConfig } from 'tsdown';

export default defineConfig({
    entry: {
        pkg: './lib/pkg.ts',
        // the magpie plugin (package.json's exports["./server"]) and the RSSHub server it runs
        magpie: './lib/magpie/plugin.ts',
        'magpie-server': './lib/magpie/server.ts',
    },
    shims: true,
    clean: true,
    dts: true,
    copy: ['lib/assets', { from: 'lib/magpie/page/*', to: 'dist-lib/magpie' }],
    outDir: 'dist-lib',
    deps: {
        onlyBundle: false,
    },
});
