import { defineConfig } from 'tsdown';

const namespaceOf = (id: string) => id.match(/[\\/]lib[\\/]routes[\\/]([^\\/]+)[\\/]/)?.[1];

export default defineConfig({
    entry: ['./lib/index.ts'],
    minify: true,
    shims: true,
    clean: true,
    copy: ['lib/assets'],
    deps: {
        onlyBundle: false,
    },
    outputOptions: {
        chunkFileNames(chunk) {
            let namespace = chunk.facadeModuleId ? namespaceOf(chunk.facadeModuleId) : undefined;
            if (!namespace) {
                const namespaces = new Set(chunk.moduleIds.map((id) => namespaceOf(id)));
                if (namespaces.size === 1) {
                    namespace = [...namespaces][0];
                }
            }
            return namespace && namespace !== chunk.name ? `${namespace}-[name]-[hash].mjs` : '[name]-[hash].mjs';
        },
    },
});
