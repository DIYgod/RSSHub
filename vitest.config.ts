import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        watch: false,
        coverage: {
            include: ['lib/**/*.ts', 'lib/**/*.tsx'],
            exclude: ['lib/routes/**', 'lib/routes-deprecated/**'],
        },
        testTimeout: 10000,
        setupFiles: ['./lib/setup.test.ts'],
        exclude: [...configDefaults.exclude, './lib/setup.test.ts'],
    },
});
