import fs from 'node:fs';

import { defineConfig } from 'tsdown';

import artTemplatesPlugin from './plugins/rollup-plugin-art-templates.ts';

export default defineConfig({
    entry: ['./lib/server.ts'],
    outDir: '.vercel/output/functions/index.func/dist',
    minify: true,
    shims: true,
    clean: true,
    plugins: [artTemplatesPlugin()],
    copy: [{ from: 'lib/assets', to: '.vercel/output/static' }],
    hooks: {
        'build:done'() {
            fs.writeFileSync(
                '.vercel/output/config.json',
                JSON.stringify(
                    {
                        version: 3,
                        routes: [
                            {
                                src: '/(.*)',
                                dest: '/',
                            },
                        ],
                    },
                    null,
                    2
                )
            );
            fs.writeFileSync(
                '.vercel/output/functions/index.func/.vc-config.json',
                JSON.stringify(
                    {
                        runtime: 'nodejs24.x',
                        handler: 'dist/server.mjs',
                        launcherType: 'Nodejs',
                    },
                    null,
                    2
                )
            );
        },
    },
});
