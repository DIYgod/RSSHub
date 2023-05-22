module.exports = {
    'cls.cn': {
        _name: '财联社',
        '.': [
            {
                title: '电报',
                docs: 'https://docs.rsshub.app/finance.html#cai-lian-she',
                source: ['/telegraph', '/'],
                target: '/cls/telegraph',
            },
            {
                title: '深度',
                docs: 'https://docs.rsshub.app/finance.html#cai-lian-she',
                source: ['/depth', '/'],
                target: (_, url) => `/cls/depth/${new URL(url).searchParams.get('id')}`,
            },
            {
                title: '热门文章排行榜',
                docs: 'https://docs.rsshub.app/finance.html#cai-lian-she',
                source: ['/'],
                target: '/cls/hot',
            },
        ],
    },
};
