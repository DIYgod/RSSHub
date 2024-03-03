export default {
    'nytimes.com': {
        _name: '纽约时报',
        '.': [
            {
                title: '新闻简报',
                docs: 'https://docs.rsshub.app/routes/traditional-media#niu-yue-shi-bao',
                source: '/zh-hans/series/daily-briefing-chinese',
                target: '/nytimes/daily_briefing_chinese',
            },
            {
                title: '畅销书排行榜',
                docs: 'https://docs.rsshub.app/routes/traditional-media#niu-yue-shi-bao',
                source: ['/books/best-sellers/:category', '/books/best-sellers/'],
                target: '/nytimes/book/:category',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#niu-yue-shi-bao',
                source: '/',
                target: '/nytimes',
            },
        ],
    },
};
