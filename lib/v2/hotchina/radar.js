module.exports = {
    'hotchina.news': {
        _name: '辛華社',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/new-media.html#xin-hua-she-shou-ye',
                source: ['/'],
                target: '/hotchina',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#xin-hua-she-fen-lei',
                source: ['/archives/category/:id', '/'],
                target: '/hotchina/category/:id?',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#xin-hua-she-biao-qian',
                source: ['/archives/tag/:id', '/'],
                target: '/hotchina/tag/:id?',
            },
        ],
    },
};
