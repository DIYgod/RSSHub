export default {
    'finviz.com': {
        _name: 'finviz',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/finance#finviz-news',
                source: ['/news.ashx', '/'],
                target: '/finviz/:category?',
            },
            {
                title: 'US Stock News',
                docs: 'https://docs.rsshub.app/routes/finance#finviz-mei-gu-gu-piao-xin-wen',
                source: ['/quote.ashx', '/'],
                target: '/finviz/news/:category?',
            },
        ],
    },
};
