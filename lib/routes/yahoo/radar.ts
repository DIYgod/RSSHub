export default {
    'yahoo.com': {
        _name: 'Yahoo',
        'hk.news': [
            {
                title: '分類新聞',
                docs: 'https://docs.rsshub.app/routes/new-media#yahoo',
                source: ['/:category/archive', '/archive'],
                target: '/yahoo/news/hk/:category?',
            },
            {
                title: '新聞來源',
                docs: 'https://docs.rsshub.app/routes/new-media#yahoo',
                source: ['/:providerId/archive', '/archive'],
                target: '/yahoo/news/hk/:providerId',
            },
        ],
        'tw.news': [
            {
                title: '分類新聞',
                docs: 'https://docs.rsshub.app/routes/new-media#yahoo',
                source: ['/:category/archive', '/archive'],
                target: '/yahoo/news/tw/:category?',
            },
            {
                title: '新聞來源',
                docs: 'https://docs.rsshub.app/routes/new-media#yahoo',
                source: ['/:providerId/archive', '/archive'],
                target: '/yahoo/news/tw/:providerId',
            },
        ],
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#yahoo',
                source: ['/'],
                target: '/yahoo/news/:region/:category?',
            },
        ],
    },
};
