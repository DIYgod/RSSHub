module.exports = {
    'reuters.com': {
        _name: '路透社',
        '.': [
            {
                title: '分类/话题/作者',
                docs: 'https://docs.rsshub.app/traditional-media.html#lu-tou-she',
                source: ['/:category/:topic?', '/'],
                target: '/reuters/:category/:topic?',
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
