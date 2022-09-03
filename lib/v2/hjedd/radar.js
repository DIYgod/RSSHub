module.exports = {
    'hjedd.com': {
        _name: '海角社区',
        '.': [
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-re-men',
                source: ['/'],
                target: '/hjedd/hot',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-xin-wen',
                source: ['/'],
                target: '/hjedd/news',
            },
            {
                title: '大事记',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-shi-ji',
                source: ['/article', '/'],
                target: '/hjedd/event',
            },
            {
                title: '原创',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-yuan-chuang',
                source: ['/'],
                target: '/hjedd/original',
            },
            {
                title: '精华',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-jing-hua',
                source: ['/'],
                target: '/hjedd/top',
            },
            {
                title: '公告',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-gong-gao',
                source: ['/'],
                target: '/hjedd/notice',
            },
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-zui-xin',
                source: ['/'],
                target: '/hjedd/latest',
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/bbs.html#hai-jiao-she-qu-da-wen-zhang',
                source: ['/article', '/'],
                target: (params, url) => `/hjedd/${new URL(url).searchParams.get('nodeId')}`,
            },
        ],
    },
};
