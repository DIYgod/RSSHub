export default {
    'cnbeta.com.tw': {
        _name: 'cnBeta.COM',
        '.': [
            {
                title: '头条资讯',
                docs: 'https://docs.rsshub.app/routes/new-media#cnbeta-com-tou-tiao-zi-xun',
                source: ['/'],
                target: '/cnbeta',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#cnbeta-com-fen-lei',
                source: ['/category/:id', '/'],
                target: '/cnbeta/category/:id',
            },
            {
                title: '主题',
                docs: 'https://docs.rsshub.app/routes/new-media#cnbeta-com-zhu-ti',
                source: ['/topics/:id', '/'],
                target: '/cnbeta/topics/:id',
            },
        ],
    },
};
