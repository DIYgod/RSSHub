module.exports = {
    'reuters.com': {
        _name: '路透社',
        '.': [
            {
                title: '路透导航',
                docs: 'https://docs.rsshub.app/traditional-media.html#lu-tou-she',
                source: [':navigation/:category?', '/'],
                target: '/reuters/:navigation/:category?',
            },
            {
                title: '订阅作者',
                docs: 'https://docs.rsshub.app/traditional-media.html#lu-tou-she-ding-yue-zuo-zhe',
                source: ['/authors/:category?', '/'],
                target: '/reuters/authors/:category?',
            },
            {
                title: '订阅深度调查栏目',
                docs: 'https://docs.rsshub.app/traditional-media.html#lu-tou-she-shen-du-diao-cha-lan-mu',
                source: ['/investigates'],
                target: '/reuters/inverstigates',
            },
        ],
    },
};
