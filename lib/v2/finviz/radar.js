module.exports = {
    'finviz.com': {
        _name: 'finviz',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/finance.html#finviz-news',
                source: ['/news.ashx', '/'],
                target: '/finviz/:category?',
            },
            {
                title: 'US Stock News',
                docs: 'https://docs.rsshub.app/finance.html#finviz-mei-gu-gu-piao-xin-wen',
                source: ['/quote.ashx', '/'],
                target: '/finviz/news/:category?',
            },
        ],
    },
};
