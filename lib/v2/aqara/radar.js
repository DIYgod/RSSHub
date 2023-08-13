module.exports = {
    'aqara.com': {
        _name: 'Aqara',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/other.html#aqara-xin-wen',
                source: ['/:region/about-us/news', '/news'],
                target: '/aqara/:region/news',
            },
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/other.html#aqara-bo-ke',
                source: ['/:region/blog'],
                target: '/aqara/:region/blog',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/other.html#aqara-fen-lei',
                source: ['/:region/category/:id'],
                target: '/aqara/:region/category/:id',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/other.html#aqara-biao-qian',
                source: ['/:region/tag/:id'],
                target: '/aqara/:region/tag/:id',
            },
        ],
        community: [
            {
                title: '社区',
                docs: 'https://docs.rsshub.app/other.html#aqara-she-qu',
                source: ['/pc', '/'],
                target: (params, url) => `/aqara/community/${new URL(url).searchParams.get('id')}`,
            },
        ],
    },
};
