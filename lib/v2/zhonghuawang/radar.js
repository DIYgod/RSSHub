module.exports = {
    'military.china.com': {
        _name: '中华网军事',
        '.': [
            {
                title: '军事新闻',
                docs: 'https://docs.rsshub.app/new-media.html#zhong-hua-wang',
                source: '/news',
                target: '/news/military',
            },
        ],
    },
    'news.china.com': {
        _name: '中华网',
        '.': [
            {
                title: '时事新闻',
                docs: 'https://docs.rsshub.app/new-media.html#zhong-hua-wang',
                source: '/:category',
                target: '/news/:category',
            },
        ],
    },
};
