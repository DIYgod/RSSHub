module.exports = {
    'nytimes.com': {
        _name: '纽约时报',
        '.': [
            {
                title: '新闻简报',
                docs: 'https://docs.rsshub.app/traditional-media.html#niu-yue-shi-bao',
                source: '/zh-hans/series/daily-briefing-chinese',
                target: '/nytimes/daily_briefing_chinese',
            },
            {
                title: '畅销书排行榜',
                docs: 'https://docs.rsshub.app/traditional-media.html#niu-yue-shi-bao',
                source: ['/books/best-sellers/:category', '/books/best-sellers/'],
                target: '/nytimes/book/:category',
            },
            {
                title: '作者新闻',
                docs: 'https://docs.rsshub.app/traditional-media.html#niu-yue-shi-bao',
                source: '/by/:byline',
                target: '/nytimes/author/:byline',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/traditional-media.html#niu-yue-shi-bao',
                source: '/',
                target: '/nytimes',
            },
        ],
    },
};
