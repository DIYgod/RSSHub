export default {
    '1point3acres.com': {
        _name: '一亩三分地',
        blog: [
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/routes/bbs#yi-mu-san-fen-di',
                source: ['/:category'],
                target: '/1point3acres/blog/:category?',
            },
        ],
        instant: [
            {
                title: '帖子',
                docs: 'https://docs.rsshub.app/routes/bbs#yi-mu-san-fen-di',
                source: ['/'],
                target: '/1point3acres/thread/:type?/:order?',
            },
            {
                title: '分区',
                docs: 'https://docs.rsshub.app/routes/bbs#yi-mu-san-fen-di',
                source: ['/section/:id', '/'],
                target: '/1point3acres/section/:id?/:type?/:order?',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/bbs#yi-mu-san-fen-di',
                source: ['/section/:id', '/'],
                target: '/1point3acres/category/:id?/:type?/:order?',
            },
            {
                title: '用户主题帖',
                docs: 'https://docs.rsshub.app/routes/bbs#yi-mu-san-fen-di',
                source: ['/profile/:id', '/'],
                target: '/1point3acres/user/:id/threads',
            },
            {
                title: '用户回帖',
                docs: 'https://docs.rsshub.app/routes/bbs#yi-mu-san-fen-di',
                source: ['/profile/:id', '/'],
                target: '/1point3acres/user/:id/posts',
            },
        ],
        offer: [
            {
                title: '录取结果',
                docs: 'https://docs.rsshub.app/routes/bbs#yi-mu-san-fen-di',
                source: ['/'],
                target: '/1point3acres/offer',
            },
        ],
    },
};
