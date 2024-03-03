export default {
    'lvv2.com': {
        _name: 'LVV2',
        '.': [
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/sort-hot'],
                target: '/lvv2/news/sort-hot',
            },
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/sort-new'],
                target: '/lvv2/news/sort-new',
            },
            {
                title: '得分',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/sort-score', '/sort-score/:sort'],
                target: (params) => (params.sort ? `/lvv2/news/sort-score/${params.sort}` : '/lvv2/news/sort-score'),
            },
            {
                title: '24小时榜',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/sort-realtime', '/sort-realtime/:sort'],
                target: (params) => (params.sort ? `/lvv2/news/sort-realtime/${params.sort}` : '/lvv2/news/sort-realtime'),
            },
            {
                title: '热门 24小时 Top 10',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/', '/sort-hot'],
                target: '/lvv2/top/sort-hot',
            },
            {
                title: '最新 24小时 Top 10',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/sort-new'],
                target: '/lvv2/top/sort-new',
            },
            {
                title: '得分 24小时 Top 10',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/sort-score', '/sort-score/:sort'],
                target: (params) => (params.sort ? `/lvv2/top/sort-score/${params.sort}` : '/lvv2/top/sort-score'),
            },
            {
                title: '24小时榜 24小时 Top 10',
                docs: 'https://docs.rsshub.app/routes/new-media#lvv2',
                source: ['/sort-realtime', '/sort-realtime/:sort'],
                target: (params) => (params.sort ? `/lvv2/top/sort-realtime/${params.sort}` : '/lvv2/top/sort-realtime'),
            },
        ],
    },
};
