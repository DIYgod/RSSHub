export default {
    'foresightnews.pro': {
        _name: 'Foresight News',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/new-media#foresight-news-shou-ye',
                source: ['/'],
                target: '/foresightnews',
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/routes/new-media#foresight-news-wen-zhang',
                source: ['/'],
                target: '/foresightnews/article',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/routes/new-media#foresight-news-kuai-xun',
                source: ['/news', '/'],
                target: '/foresightnews/news',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/routes/new-media#foresight-news-zhuan-lan',
                source: ['/column/detail/:id', '/'],
                target: '/foresightnews/column/:id',
            },
        ],
    },
};
