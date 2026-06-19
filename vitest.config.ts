import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [tsconfigPaths({ root: '.' })],
    test: {
        watch: false,
        coverage: {
            include: ['lib/**/*.ts', 'lib/**/*.tsx'],
            exclude: ['lib/routes/**', 'lib/routes-deprecated/**', 'tests/**'],
        },
        testTimeout: 10000,
        // SPEC route tests (`tests/routes/spec/*.test.ts`) opt into MSW by
        // importing `./tests/setup` from each test file. We do NOT add that
        // file to `setupFiles` because the existing `lib/setup.test.ts` already
        // owns the upstream-route MSW server; mixing the two would cause
        // handler collisions on overlapping URLs.
        setupFiles: ['./lib/setup.test.ts'],
        exclude: [...configDefaults.exclude, './lib/setup.test.ts'],
    },
});
