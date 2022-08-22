module.exports = {
    'huxiu.com': {
        _name: '虎嗅',
        '.': [
            {
                title: '首页资讯',
                docs: 'https://docs.rsshub.app/new-media.html#hu-xiu',
                source: ['/article', '/'],
                target: '/huxiu/article',
            },
            {
                title: '24小时',
                docs: 'https://docs.rsshub.app/new-media.html#hu-xiu',
                source: ['/moment', '/'],
                target: '/huxiu/moment',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#hu-xiu',
                source: ['/tags/:id'],
                target: (params) => `/huxiu/tag/${params.id.replace('.html', '')}`,
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/new-media.html#hu-xiu',
            },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/new-media.html#hu-xiu',
                source: ['/member/:id/*', '/'],
                target: '/huxiu/author/:id',
            },
            {
                title: '文集',
                docs: 'https://docs.rsshub.app/new-media.html#hu-xiu',
                source: ['/collection/:id', '/'],
                target: (params) => `/huxiu/collection/${params.id.replace('.html', '')}`,
            },
        ],
    },
};
