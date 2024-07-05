import prettier from "eslint-plugin-prettier";
import stylistic from "@stylistic/eslint-plugin";
import unicorn from "eslint-plugin-unicorn";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
// eslint-disable-next-line n/no-extraneous-import
import parser from "yaml-eslint-parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: [
        "**/coverage",
        "**/.vscode",
        "**/docker-compose.yml",
        "!.github",
        "lib/routes-deprecated",
        "lib/router.js",
        "**/babel.config.js",
        "scripts/docker/minify-docker.js",
    ],
}, ...compat.extends(
    "eslint:recommended",
    "plugin:n/recommended",
    "plugin:unicorn/recommended",
    "plugin:prettier/recommended",
    "plugin:yml/recommended",
    "plugin:@typescript-eslint/recommended",
), {
    plugins: {
        prettier,
        "@stylistic": stylistic,
        unicorn,
        "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            ...globals.browser,
        },

        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
    },

    rules: {
        "array-callback-return": ["error", {
            allowImplicit: true,
        }],

        "no-await-in-loop": 2,
        "no-control-regex": 0,
        "no-duplicate-imports": 2,
        "no-prototype-builtins": 0,
        "arrow-body-style": 2,
        "block-scoped-var": 2,
        curly: 2,
        "dot-notation": 2,
        eqeqeq: 2,

        "default-case": ["warn", {
            commentPattern: "^no default$",
        }],

        "default-case-last": 2,
        "no-console": 2,
        "no-eval": 2,
        "no-extend-native": 2,
        "no-extra-label": 2,

        "no-implicit-coercion": ["error", {
            boolean: false,
            number: false,
            string: false,
            disallowTemplateShorthand: true,
        }],

        "no-implicit-globals": 2,
        "no-labels": 2,
        "no-multi-str": 2,
        "no-new-func": 2,
        "no-restricted-imports": 2,
        "no-unneeded-ternary": 2,
        "no-useless-computed-key": 2,
        "no-useless-concat": 1,
        "no-useless-rename": 2,
        "no-var": 2,
        "object-shorthand": 2,
        "prefer-arrow-callback": 2,
        "prefer-const": 2,
        "prefer-object-has-own": 2,
        "no-useless-escape": 1,

        "prefer-regex-literals": ["error", {
            disallowRedundantWrapping: true,
        }],

        "require-await": 2,
        "@typescript-eslint/ban-ts-comment": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-var-requires": 0,
        "unicorn/consistent-destructuring": 1,
        "unicorn/consistent-function-scoping": 1,
        "unicorn/explicit-length-check": 0,

        "unicorn/filename-case": ["error", {
            case: "kebabCase",
            ignore: [String.raw`.*\.(yaml|yml)$`, String.raw`RequestInProgress\.js$`],
        }],

        "unicorn/new-for-builtins": 0,
        "unicorn/no-array-callback-reference": 1,
        "unicorn/no-array-reduce": 1,
        "unicorn/no-await-expression-member": 0,
        "unicorn/no-empty-file": 1,
        "unicorn/no-hex-escape": 1,
        "unicorn/no-null": 0,
        "unicorn/no-object-as-default-parameter": 1,
        "unicorn/no-process-exit": 0,
        "unicorn/no-useless-switch-case": 0,

        "unicorn/no-useless-undefined": ["error", {
            checkArguments: false,
        }],

        "unicorn/numeric-separators-style": ["warn", {
            onlyIfContainsSeparator: false,

            number: {
                minimumDigits: 7,
                groupLength: 3,
            },

            binary: {
                minimumDigits: 9,
                groupLength: 4,
            },

            octal: {
                minimumDigits: 9,
                groupLength: 4,
            },

            hexadecimal: {
                minimumDigits: 5,
                groupLength: 2,
            },
        }],

        "unicorn/prefer-code-point": 1,
        "unicorn/prefer-logical-operator-over-ternary": 1,
        "unicorn/prefer-module": 0,
        "unicorn/prefer-node-protocol": 0,

        "unicorn/prefer-number-properties": ["warn", {
            checkInfinity: false,
        }],

        "unicorn/prefer-object-from-entries": 1,
        "unicorn/prefer-regexp-test": 1,
        "unicorn/prefer-spread": 1,
        "unicorn/prefer-string-replace-all": 1,
        "unicorn/prefer-string-slice": 0,

        "unicorn/prefer-switch": ["warn", {
            emptyDefaultCase: "do-nothing-comment",
        }],

        "unicorn/prefer-top-level-await": 0,
        "unicorn/prevent-abbreviations": 0,
        "unicorn/switch-case-braces": ["error", "avoid"],
        "unicorn/text-encoding-identifier-case": 0,
        "@stylistic/arrow-parens": 2,
        "@stylistic/arrow-spacing": 2,
        "@stylistic/comma-spacing": 2,
        "@stylistic/comma-style": 2,
        "@stylistic/function-call-spacing": 2,
        "@stylistic/keyword-spacing": 2,
        "@stylistic/linebreak-style": 2,

        "@stylistic/lines-around-comment": ["error", {
            beforeBlockComment: false,
        }],

        "@stylistic/no-multiple-empty-lines": 2,
        "@stylistic/no-trailing-spaces": 2,
        "@stylistic/rest-spread-spacing": 2,
        "@stylistic/semi": 2,
        "@stylistic/space-before-blocks": 2,
        "@stylistic/space-in-parens": 2,
        "@stylistic/space-infix-ops": 2,
        "@stylistic/space-unary-ops": 2,
        "@stylistic/spaced-comment": 2,

        "n/no-extraneous-require": ["error", {
            allowModules: [
                "puppeteer-extra-plugin-user-preferences",
                "puppeteer-extra-plugin-user-data-dir",
            ],
        }],

        "n/no-deprecated-api": 1,
        "n/no-missing-import": 0,
        "n/no-missing-require": 0,
        "n/no-process-exit": 0,
        "n/no-unpublished-import": 0,

        "n/no-unpublished-require": ["error", {
            allowModules: ["tosource"],
        }],

        "prettier/prettier": 0,

        "yml/quotes": ["error", {
            prefer: "single",
        }],

        "yml/no-empty-mapping-value": 0,
    },
}, {
    files: ["**/*.yaml", "**/*.yml"],

    languageOptions: {
        parser,
    },

    rules: {
        "lines-around-comment": ["error", {
            beforeBlockComment: false,
        }],
    },
}];
