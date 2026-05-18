import { eslintCompatPlugin } from '@oxlint/plugins';

const rule = {
    meta: {
        type: 'suggestion',
        docs: {
            description: 'enforce using `async/await` syntax over Promises',
            url: 'https://github.com/github/eslint-plugin-github/blob/main/docs/rules/no-then.md',
            recommended: true,
        },
        schema: [],
        messages: {
            preferAsyncAwait: 'Prefer async/await to Promise.{{method}}()',
        },
    },

    createOnce(context) {
        return {
            MemberExpression(node) {
                if (node.property && node.property.name === 'then') {
                    context.report({
                        node: node.property,
                        messageId: 'preferAsyncAwait',
                        data: { method: 'then' },
                    });
                } else if (node.property && node.property.name === 'catch') {
                    context.report({
                        node: node.property,
                        messageId: 'preferAsyncAwait',
                        data: { method: 'catch' },
                    });
                }
            },
        };
    },
};

export default eslintCompatPlugin({
    meta: {
        name: 'github',
    },
    rules: {
        'no-then': rule,
    },
});
