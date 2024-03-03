export default {
    'dx2025.com': {
        _name: '东西智库',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/multimedia#e-hentai-fen-lei',
                source: ['/archives/category/:type/:category?', '/archives/category/:type'],
                target: (params) => `/dx2025/${params.type}/${params.category ?? ''}`,
            },
        ],
    },
};
