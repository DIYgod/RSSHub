module.exports = {
    'dx2025.com': {
        _name: '东西智库',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#e-hentai-fen-lei',
                source: ['/archives/category/:type/:category?', '/archives/category/:type'],
                target: (params) => `/dx2025/${params.type}/${params.category ? params.category : ''}`,
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/multimedia.html#e-hentai-biao-qian',
                source: ['/archives/tag/:tag'],
                target: '/dx2025/tag/:tag',
            },
        ],
    },
};
