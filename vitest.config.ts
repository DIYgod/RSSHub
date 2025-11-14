import { defineConfig, configDefaults } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';

export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        watch: false,
        coverage: {
            include: ['lib/**/*.ts'],
            exclude: ['lib/routes/**', 'lib/routes-deprecated/**'],
        },
        testTimeout: 10000,
        setupFiles: ['./lib/setup.test.ts'],
        exclude: [...configDefaults.exclude, './lib/setup.test.ts'],
        // TODO: workaround for node 25.2
        execArgv: ['--localstorage-file', path.resolve(os.tmpdir(), `vitest-${process.pid}.localstorage`)],
    },
});
