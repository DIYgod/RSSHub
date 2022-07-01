module.exports = {
    'gcores.com': {
        _name: '机核网',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#ji-he-wang-fen-lei',
                source: ['/:category'],
                target: '/gcores/category/:category',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#ji-he-wang-biao-qian',
                source: ['/categories/:tag', '/'],
                target: '/gcores/tag/:tag',
            },
        ],
    },
};
