module.exports = {
    'china.com': {
        _name: '中华网',
        military: [
            {
                title: '军事新闻',
                docs: 'https://docs.rsshub.app/new-media.html#zhong-hua-wang',
                source: '/news',
                target: '/china/news/military',
            },
        ],
        news: [
            {
                title: '时事新闻',
                docs: 'https://docs.rsshub.app/new-media.html#zhong-hua-wang',
                source: '/:category',
                target: '/china/news/:category?',
            },
        ],
    },
};
