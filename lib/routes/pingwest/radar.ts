export default {
    'pingwest.com': {
        _name: '品玩',
        '.': [
            {
                title: '实时要闻',
                docs: 'https://docs.rsshub.app/routes/new-media#ping-wan',
                source: ['/status', '/'],
                target: '/pingwest/status',
            },
            {
                title: '话题动态',
                docs: 'https://docs.rsshub.app/routes/new-media#ping-wan',
                source: ['/tag/:tag', '/'],
                target: '/pingwest/tag/:tag/1/fulltext',
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/routes/new-media#ping-wan',
                source: ['/user/:uid/:type', '/'],
                target: '/pingwest/user/:uid/:type',
            },
        ],
    },
};
