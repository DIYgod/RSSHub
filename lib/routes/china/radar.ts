export default {
    'china.com': {
        _name: '中华网',

        finance: [
            {
                title: '财经新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#zhong-hua-wang',
                source: '/:category',
                target: '/china/finance/:category?',
            },
        ],
        military: [
            {
                title: '军事新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#zhong-hua-wang',
                source: '/news',
                target: '/china/news/military',
            },
        ],
        news: [
            {
                title: '时事新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#zhong-hua-wang',
                source: '/:category',
                target: '/china/news/:category?',
            },
        ],
    },
};
