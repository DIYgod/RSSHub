module.exports = {
    'reuters.com': {
        _name: '路透社',
        '.': [
            {
                title: '导航',
                docs: 'https://docs.rsshub.app/traditional-media.html#lu-tou-she',
                source: ['/:navigation/:category?', '/'],
                target: '/reuters/:navigation/:category?',
            },
            {
                title: '订阅作者',
                docs: 'https://docs.rsshub.app/traditional-media.html#lu-tou-she',
                source: ['/authors/:category?', '/'],
                target: '/reuters/authors/:category?',
            },
            {
                title: '深度调查栏目',
                docs: 'https://docs.rsshub.app/traditional-media.html#lu-tou-she',
                source: ['/investigates'],
                target: '/reuters/inverstigates',
            },
        ],
    },
};
