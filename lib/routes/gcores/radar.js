module.exports = {
    'gcores.com': {
        _name: '机核网',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#ji-he-wang-fen-lei',
                source: ['/:category'],
                target: '/gcores/category/:category',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/new-media#ji-he-wang-biao-qian',
                source: ['/categories/:tag', '/'],
                target: '/gcores/tag/:tag',
            },
            {
                title: '播客',
                docs: 'https://docs.rsshub.app/routes/new-media#ji-he-wang-bo-ke',
                source: ['/radios'],
                target: '/gcores/radios',
            },
            {
                title: '播客-分类',
                docs: 'https://docs.rsshub.app/routes/new-media#ji-he-wang-bo-ke',
                source: ['/categories/:category'],
                target: '/gcores/radios/:category',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/new-media#ji-he-wang-zhuan-ti',
                source: ['/collections/:collection'],
                target: '/gcores/collections/:collection',
            },
        ],
    },
};
