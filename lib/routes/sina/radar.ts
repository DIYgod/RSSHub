export default {
    'sina.com.cn': {
        _name: '新浪',
        finance: [
            {
                title: '财经 - 国內',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-lang',
                source: ['/china', '/'],
                target: '/sina/finance/china',
            },
            {
                title: '美股',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-lang',
                source: ['/stock/usstock', '/'],
                target: '/sina/finance/stock/usstock',
            },
        ],
        news: [
            {
                title: '滚动新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-lang',
                source: ['/roll'],
                target: (_, url) => `/sina/rollnews/${new URL(url).hash.match(/lid=(\d+)/)[1]}`,
            },
        ],
        sports: [
            {
                title: '体育 - 综合',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-lang',
                source: ['/others/:type', '/:type'],
                target: (params) => `/sina/sports/${params.type}`,
            },
        ],
        tech: [
            {
                title: '专栏 - 创事记',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-lang',
                source: ['/chuangshiji', '/'],
                target: '/sina/csj',
            },
            {
                title: '科技 - 科学探索',
                docs: 'https://docs.rsshub.app/routes/new-media#xin-lang',
                source: ['/discovery', '/'],
                target: '/sina/discovery/zx',
            },
        ],
    },
};
