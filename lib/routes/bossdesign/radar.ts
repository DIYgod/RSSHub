export default {
    'bossdesign.cn': {
        _name: 'Boss 设计',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/design#boss-she-ji',
                source: ['/:category?', '/'],
                target: (params) => `/bossdesign${params.category ? `/${params.category}` : ''}`,
            },
        ],
    },
};
