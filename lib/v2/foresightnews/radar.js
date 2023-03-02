module.exports = {
    'foresightnews.pro': {
        _name: 'Foresight News',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/new-media.html#foresight-news-shou-ye',
                source: ['/article', '/'],
                target: '/foresightnews',
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/new-media.html#foresight-news-wen-zhang',
                source: ['/article', '/'],
                target: '/foresightnews/article',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#foresight-news-kuai-xun',
                source: ['/news', '/'],
                target: '/foresightnews/news',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/new-media.html#foresight-news-zhuan-lan',
                source: ['/column/detail/:id', '/'],
                target: '/foresightnews/column/:id',
            },
        ],
    },
};
