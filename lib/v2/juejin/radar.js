module.exports = {
    'juejin.cn': {
        _name: '掘金',
        '.': [
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin-biao-qian',
                source: '/tag/:tag',
                target: '/juejin/tag/:tag',
            },
            {
                title: '小册',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin-xiao-ce',
                source: '/books',
                target: '/juejin/books',
            },
            {
                title: '沸点',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin-fei-dian',
                source: ['/pins/:type', '/pins/topic/:type'],
                target: (params) => (params.type !== 'recommended' ? '/juejin/pins/:type' : '/juejin/pins'),
            },
            {
                title: '用户专栏',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin-zhuan-lan',
                source: ['/user/:id', '/user/:id/posts'],
                target: '/juejin/posts/:id',
            },
            {
                title: '收藏集',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin-shou-cang-ji',
                source: ['/user/:id', '/user/:id/collections'],
                target: '/juejin/collections/:id',
            },
            {
                title: '单个收藏夹',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin-dan-ge-shou-cang-jia',
                source: '/collection/:collectionId',
                target: '/juejin/collection/:collectionId',
            },
            {
                title: '分享',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin',
                source: ['/user/:userId', '/user/:userId/shares'],
                target: '/juejin/shares/:userId',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin',
                source: '/column/:id',
                target: '/juejin/column/:id',
            },
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/programming.html#jue-jin',
                source: ['/user/:id', '/user/:id/news'],
                target: '/juejin/news/:userId',
            },
        ],
    },
};
