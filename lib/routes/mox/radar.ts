export default {
    'mox.moe': {
        _name: 'Mox.moe',
        '.': [
            {
                title: '首頁',
                docs: 'https://docs.rsshub.app/routes/anime#mox-moe-shou-ye',
                source: ['/l/:category', '/'],
                target: '/mox/:category?',
            },
        ],
    },
};
