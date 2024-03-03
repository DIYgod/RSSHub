import { defineConfig, defaultExclude } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        watch: false,
        coverage: {
            include: ['lib/**/*.ts'],
            exclude: ['lib/routes/**', 'lib/routes-deprecated/**'],
        },
        testTimeout: 10000,
        exclude: ['website', ...defaultExclude],
    },
});
