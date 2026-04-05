import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
// import { importX } from 'eslint-plugin-import-x';
// import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginYml from 'eslint-plugin-yml';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

const SOURCE_FILES_GLOB = '**/*.?([cm])[jt]s?(x)';

export default defineConfig([
    {
        ignores: ['**/coverage', '**/.vscode', '**/docker-compose.yml', '!.github', 'assets/build', 'lib/routes-deprecated', 'lib/router.js', 'dist', 'dist-lib', 'dist-worker'],
    },
    {
        files: [SOURCE_FILES_GLOB],
        plugins: {
            '@typescript-eslint': typescriptEslint,
            // github,
            js,
        },
        // extends: [typescriptEslint.configs['flat/recommended'], typescriptEslint.configs['flat/stylistic'], n.configs['flat/recommended-script']],

        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },

            parser: tsParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
        },

        linterOptions: {
            reportUnusedDisableDirectives: false,
        },

        rules: {
            // #region typescript
            /*
            '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],

            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/consistent-indexed-object-style': 'off', // stylistic
            '@typescript-eslint/consistent-type-definitions': 'off', // stylistic
            '@typescript-eslint/no-empty-function': 'off', // stylistic && tests
            '@typescript-eslint/no-explicit-any': 'off',

            '@typescript-eslint/no-inferrable-types': ['error', { ignoreParameters: true, ignoreProperties: true }],
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
            '@typescript-eslint/no-unused-vars': ['error', { args: 'after-used', argsIgnorePattern: '^_' }],
            */
            // #endregion
        },
    },
    {
        files: ['.puppeteerrc.cjs'],
        rules: {
            '@typescript-eslint/no-require-imports': 'off',
        },
    },
    {
        /*
        files: [SOURCE_FILES_GLOB],
        plugins: {
            'simple-import-sort': simpleImportSort,
            'import-x': importX,
        },
        rules: {
            'sort-imports': 'off',
            'import-x/order': 'off',
            'simple-import-sort/imports': 'error',
            'simple-import-sort/exports': 'error',

            'import-x/first': 'error',
            'import-x/newline-after-import': 'error',
            'no-duplicate-imports': 'off',
            'import-x/no-duplicates': 'error',

            '@typescript-eslint/consistent-type-imports': 'error',
            'import-x/consistent-type-specifier-style': ['error', 'prefer-top-level'],
        },*/
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
