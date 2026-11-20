import { defineConfig } from 'oxlint';

import base from './oxlint.config.ts';

export default defineConfig({
    ...base,
    options: {
        ...base.options,
        respectEslintDisableDirectives: false,
    },
    rules: {
        ...base.rules,
        // "quality/no-array-filter-map": "error",
        // "quality/no-chained-type-assertions": "error",
        'quality/no-conditional-empty-object-spread': 'error',
        'quality/no-known-value-widening': 'error',
        // "anti-slop/no-module-mocking": "error",
        'quality/no-object-parameters': 'error',
        'quality/no-reduce-accumulator-copy': 'error',
        'quality/no-reflect-apply': 'error',
        'quality/no-reflect-get': 'error',
        // "anti-slop/no-runtime-typeof": ["error", { "allowInTypeGuards": true }],
        'anti-slop/no-shape-in-symbol-names': 'error',
        'anti-slop/no-unknown-parameters': 'error',
        'quality/no-unknown-returns': 'error',
        'quality/no-unknown-type-aliases': 'error',
        'quality/no-unsafe-dictionary-type': 'error',
        'quality/no-widen-then-assert': 'error',
        // "anti-slop/require-readable-spacing": "error",
        // "anti-slop/require-safety-comment-for-type-assertion": "error"
    },
});
