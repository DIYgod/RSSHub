import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
// import { importX } from 'eslint-plugin-import-x';
import n from 'eslint-plugin-n';
// import simpleImportSort from 'eslint-plugin-simple-import-sort';
import eslintPluginYml from 'eslint-plugin-yml';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

// import github from './eslint-plugins/no-then.js';
// import nsfwFlagPlugin from './eslint-plugins/nsfw-flag.js';

const SOURCE_FILES_GLOB = '**/*.?([cm])[jt]s?(x)';

export default defineConfig([
    // {
    //     plugins: {
    //         '@rsshub/nsfw-flag': nsfwFlagPlugin,
    //     },
    //     rules: {
    //         '@rsshub/nsfw-flag/add-nsfw-flag': 'error',
    //     },
    // },
    {
        ignores: ['**/coverage', '**/.vscode', '**/docker-compose.yml', '!.github', 'assets/build', 'lib/routes-deprecated', 'lib/router.js', 'dist', 'dist-lib', 'dist-worker'],
    },
    {
        files: [SOURCE_FILES_GLOB],
        plugins: {
            '@stylistic': stylistic,
            '@typescript-eslint': typescriptEslint,
            // github,
            js,
            n,
        },
        // extends: [js.configs.recommended, typescriptEslint.configs['flat/recommended'], typescriptEslint.configs['flat/stylistic'], n.configs['flat/recommended-script']],

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
            // #region possible problems
            /*
            'array-callback-return': ['error', { allowImplicit: true }],

            'no-await-in-loop': 'error',
            'no-control-regex': 'off',
            'no-prototype-builtins': 'off',
            */
            // #endregion

            // #region suggestions
            /*
            'arrow-body-style': 'error',
            'block-scoped-var': 'error',
            curly: 'error',
            'dot-notation': 'error',
            eqeqeq: 'error',

            'default-case': ['warn', { commentPattern: '^no default$' }],

            'default-case-last': 'error',
            'no-console': 'error',
            'no-eval': 'error',
            'no-extend-native': 'error',
            'no-extra-label': 'error',

            'no-implicit-coercion': [
                'error',
                {
                    boolean: false,
                    number: false,
                    string: false,
                    disallowTemplateShorthand: true,
                },
            ],

            'no-implicit-globals': 'error',
            'no-labels': 'error',
            'no-lonely-if': 'error',
            'no-multi-str': 'error',
            'no-new-func': 'error',
            */
            'no-restricted-syntax': [
                'error',
                {
                    selector: "CallExpression[callee.property.name='get'][arguments.length=0]",
                    message: 'Please use .toArray() instead.',
                },
                {
                    selector: "CallExpression[callee.property.name='toArray'] MemberExpression[object.callee.property.name='map']",
                    message: 'Please use .toArray() before .map().',
                },
                {
                    selector: 'CallExpression[callee.property.name="catch"] > ArrowFunctionExpression[params.length=0][body.value=null]',
                    message: 'Usage of .catch(() => null) is not allowed. Please handle the error appropriately.',
                },
                {
                    selector: 'CallExpression[callee.property.name="catch"] > ArrowFunctionExpression[params.length=0][body.type="Identifier"][body.name="undefined"]',
                    message: 'Usage of .catch(() => undefined) is not allowed. Please handle the error appropriately.',
                },
                {
                    selector: 'CallExpression[callee.property.name="catch"] > ArrowFunctionExpression[params.length=0] > ArrayExpression[elements.length=0]',
                    message: 'Usage of .catch(() => []) is not allowed. Please handle the error appropriately.',
                },
                {
                    selector: 'CallExpression[callee.property.name="catch"] > ArrowFunctionExpression[params.length=0] > BlockStatement[body.length=0]',
                    message: 'Usage of .catch(() => {}) is not allowed. Please handle the error appropriately.',
                },
                {
                    selector: 'CallExpression[callee.name="load"] AwaitExpression > CallExpression',
                    message: 'Do not use await in call expressions. Extract the result into a variable first.',
                },
            ],
            /*
            'no-unneeded-ternary': 'error',
            'no-useless-computed-key': 'error',
            'no-useless-concat': 'warn',
            'no-useless-rename': 'error',
            'no-var': 'error',
            'object-shorthand': 'error',
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-object-has-own': 'error',

            'prefer-regex-literals': [
                'error',
                {
                    disallowRedundantWrapping: true,
                },
            ],

            'require-await': 'error',
            */
            // #endregion

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

            // #region stylistic
            /*
            '@stylistic/arrow-parens': 'error',
            '@stylistic/arrow-spacing': 'error',
            '@stylistic/comma-spacing': 'error',
            '@stylistic/comma-style': 'error',
            '@stylistic/function-call-spacing': 'error',
            '@stylistic/keyword-spacing': 'off',
            '@stylistic/linebreak-style': 'error',

            '@stylistic/lines-around-comment': ['error', { beforeBlockComment: false }],

            '@stylistic/no-multiple-empty-lines': 'error',
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/rest-spread-spacing': 'error',
            '@stylistic/semi': 'error',
            '@stylistic/space-before-blocks': 'error',
            '@stylistic/space-in-parens': 'error',
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/space-unary-ops': 'error',
            '@stylistic/spaced-comment': 'error',
            */
            // #endregion

            // #region node specific rules
            /*
            'n/no-extraneous-require': 'error',
            'n/no-deprecated-api': 'warn',
            'n/no-missing-import': 'off',
            'n/no-missing-require': 'off',
            'n/no-process-exit': 'off',
            'n/no-unpublished-import': 'off',

            'n/no-unpublished-require': ['error', { allowModules: ['tosource'] }],

            'n/no-unsupported-features/node-builtins': [
                'error',
                {
                    version: '^22.20.0 || ^24',
                    allowExperimental: true,
                    ignores: [],
                },
            ],
            */
            // #endregion

            // github
            // 'github/no-then': 'warn',
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
