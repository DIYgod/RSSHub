import { eslintCompatPlugin } from '@oxlint/plugins';

import { noModuleMockingRule } from './rules/no-module-mocking.ts';
import { noRuntimeTypeofRule } from './rules/no-runtime-typeof.ts';
import { noForbiddenTermInSymbolNamesRule } from './rules/no-shape-in-symbol-names.ts';
import { noUnknownParametersRule } from './rules/no-unknown-parameters.ts';
// import { requireReadableSpacingRule } from './rules/require-readable-spacing.ts';
import { requireSafetyCommentForTypeAssertionRule } from './rules/require-safety-comment-for-type-assertion.ts';

/** Generic Oxlint rules that reject low-evidence and low-signal implementation patterns. */
const antiSlopPlugin = eslintCompatPlugin({
    meta: { name: 'anti-slop' },
    rules: {
        'no-module-mocking': noModuleMockingRule,
        'no-runtime-typeof': noRuntimeTypeofRule,
        'no-shape-in-symbol-names': noForbiddenTermInSymbolNamesRule,
        'no-unknown-parameters': noUnknownParametersRule,
        // 'require-readable-spacing': requireReadableSpacingRule,
        'require-safety-comment-for-type-assertion': requireSafetyCommentForTypeAssertionRule,
    },
});

export default antiSlopPlugin;
