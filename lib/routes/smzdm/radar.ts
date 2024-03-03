export default {
    'smzdm.com': {
        _name: '什么值得买',
        post: [
            {
                title: '好文',
                docs: 'https://docs.rsshub.app/routes/shopping#shen-me-zhi-de-mai',
                source: '/:day',
                target: (params) => `/smzdm/haowen/${params.day.replace('hot_', '')}`,
            },
            {
                title: '好文分类',
                docs: 'https://docs.rsshub.app/routes/shopping#shen-me-zhi-de-mai',
                source: ['/fenlei/:name'],
                target: '/smzdm/haowen/fenlei/:name',
            },
        ],
        search: [
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/routes/shopping#shen-me-zhi-de-mai',
                source: '/',
                target: (_, url) => `/smzdm/keyword/${new URL(url).searchParams.get('s')}`,
            },
        ],
        www: [
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/routes/shopping#shen-me-zhi-de-mai',
                source: '/top',
            },
        ],
        zhiyou: [
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/routes/shopping#shen-me-zhi-de-mai',
                source: '/member/:uid/article',
                target: '/smzdm/article/:uid',
            },
            {
                title: '用户爆料',
                docs: 'https://docs.rsshub.app/routes/shopping#shen-me-zhi-de-mai',
                source: '/member/:uid/baoliao',
                target: '/smzdm/baoliao/:uid',
            },
        ],
    },
};
