export default {
    'gofans.cn': {
        _name: 'GoFans',
        '.': [
            {
                title: '最新限免 / 促销应用',
                docs: 'https://docs.rsshub.app/program-update#gofans',
                source: ['/limited/:kind?', '/'],
                target: (params) => `/gofans${(params.kind && (params.kind === 'macos' ? '/macos' : '/ios')) || ''}`,
            },
        ],
    },
};
