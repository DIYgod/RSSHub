export default {
    'juejin.cn': {
        _name: '掘金',
        '.': [
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/programming#jue-jin-biao-qian',
                source: '/tag/:tag',
                target: '/juejin/tag/:tag',
            },
            {
                title: '小册',
                docs: 'https://docs.rsshub.app/routes/programming#jue-jin-xiao-ce',
                source: '/books',
                target: '/juejin/books',
            },
            {
                title: '沸点',
                docs: 'https://docs.rsshub.app/routes/programming#jue-jin-fei-dian',
                source: ['/pins/:type', '/pins/topic/:type'],
                target: (params) => (params.type === 'recommended' ? '/juejin/pins' : '/juejin/pins/:type'),
            },
            {
                title: '用户专栏',
                docs: 'https://docs.rsshub.app/routes/programming#jue-jin-zhuan-lan',
                source: ['/user/:id', '/user/:id/posts'],
                target: '/juejin/posts/:id',
            },
            {
                title: '收藏集',
                docs: 'https://docs.rsshub.app/routes/programming#jue-jin-shou-cang-ji',
                source: ['/user/:id', '/user/:id/collections'],
                target: '/juejin/collections/:id',
            },
            {
                title: '单个收藏夹',
                docs: 'https://docs.rsshub.app/routes/programming#jue-jin-dan-ge-shou-cang-jia',
                source: '/collection/:collectionId',
                target: '/juejin/collection/:collectionId',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/routes/programming#jue-jin',
                source: '/column/:id',
                target: '/juejin/column/:id',
            },
        ],
    },
};
