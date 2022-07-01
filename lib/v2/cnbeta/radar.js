module.exports = {
    'cnbeta.com': {
        _name: 'cnBeta',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/new-media.html#cnbeta-zuixin',
                source: ['/'],
                target: '/cnbeta',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#cnbeta-fenlei',
                source: ['/category/:id', '/'],
                target: '/cnbeta/category/:id',
            },
            {
                title: '主题',
                docs: 'https://docs.rsshub.app/new-media.html#cnbeta-zhuti',
                source: ['/topics/:id', '/'],
                target: '/cnbeta/topics/:id',
            },
        ],
    },
};
