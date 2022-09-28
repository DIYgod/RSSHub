module.exports = {
    'gelonghui.com': {
        _name: '格隆汇',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/finance.html#ge-long-hui',
                source: ['/tag/:tag', '/'],
                target: (params) => `/gelonghui/home${params.tag ? `/${params.tag}` : ''}`,
            },
            {
                title: '搜索关键字',
                docs: 'https://docs.rsshub.app/finance.html#ge-long-hui',
                source: ['/search'],
                target: (_, url) => `/gelonghui/keyword/${new URL(url).searchParams.get('keyword')}`,
            },
            {
                title: '主题文章',
                docs: 'https://docs.rsshub.app/finance.html#ge-long-hui',
                source: ['/subject/:id'],
                target: '/gelonghui/subject/:id',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/finance.html#ge-long-hui',
                source: ['/user/:id'],
                target: '/gelonghui/user/:id',
            },
        ],
    },
};
