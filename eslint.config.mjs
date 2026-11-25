// oxlint-disable simple-import-sort/imports
import eslintPluginYml from 'eslint-plugin-yml';
import { defineConfig } from 'eslint/config';

export default defineConfig([
    {
        ignores: ['**/coverage', '**/.vscode', '**/docker-compose.yml', '!.github', 'assets/build', 'dist', 'dist-lib', 'dist-worker', '**/*.?([cm])js'],
    },
    {
        files: ['**/*.yaml', '**/*.yml'],
        ignores: ['pnpm-lock.yaml'],
        plugins: {
            yml: eslintPluginYml,
        },
        language: 'yml/yaml',
        rules: {
            'lines-around-comment': ['error', { beforeBlockComment: false }],

            'yml/indent': ['error', 4, { indicatorValueIndent: 2 }],

            'yml/no-empty-mapping-value': 'off',

            'yml/quotes': ['error', { prefer: 'single' }],
        },
    },
]);
