module.exports = {
    'liulinblog.com': {
        _name: '木木博客',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/new-media#mu-mu-bo-ke',
                source: ['/:channel', '/'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = url.href.match(/\.com(.*?)/)[1];

                    return `/liulinblog${path === '/' ? '' : path}`;
                },
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/new-media#mu-mu-bo-ke',
                source: ['/tag/:id', '/'],
                target: '/liulinblog/tag/:id',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/new-media#mu-mu-bo-ke',
                source: ['/series/:id', '/'],
                target: '/liulinblog/series/:id',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/new-media#mu-mu-bo-ke',
                source: ['/search/:keyword', '/'],
                target: '/liulinblog/search/:keyword',
            },
            {
                title: '60秒读懂世界',
                docs: 'https://docs.rsshub.app/routes/new-media#mu-mu-bo-ke',
                source: ['/kuaixun', '/'],
                target: '/liulinblog/kuaixun',
            },
            {
                title: '网络营销',
                docs: 'https://docs.rsshub.app/routes/new-media#mu-mu-bo-ke',
                source: ['/:channel', '/'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = url.href.match(/\.com(.*?)/)[1];

                    return `/liulinblog${path === '/' ? '' : path}`;
                },
            },
        ],
    },
};
