module.exports = {
    presets: [
        [
            'next/babel',
            {
                'preset-react': {
                    throwIfNamespace: false,
                },
            },
        ],
        [
            '@babel/preset-env',
            {
                targets: {
                    node: 'current',
                },
            },
        ],
        '@babel/preset-typescript',
    ],
    plugins: ['@babel/plugin-transform-private-methods'],
};
