export default {
    'yxdown.com': {
        _name: '游讯网',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/game#you-xun-wang',
                source: ['/news/:category', '/news'],
                target: (params) => `/yxdown/news${params.category ? `/${params.category}` : ''}`,
            },
            {
                title: '精彩推荐',
                docs: 'https://docs.rsshub.app/routes/game#you-xun-wang',
                source: ['/'],
                target: '/yxdown/recommend',
            },
        ],
    },
};
