export default {
    'douban.com': {
        _name: '豆瓣',
        www: [
            {
                title: '用户的广播',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/people/:user/',
                target: (params, url, document) => {
                    const uid = document && document.querySelector('html').innerHTML.match(/"id":"(\d+)"/)[1];
                    return uid ? `/douban/people/${uid}/status` : '';
                },
            },
            {
                title: '小组-最新',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/group/:groupid',
                target: '/douban/group/:groupid',
            },
            {
                title: '小组-最热',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/group/:groupid',
                target: '/douban/group/:groupid/essence',
            },
            {
                title: '小组-精华',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/group/:groupid',
                target: '/douban/group/:groupid/elite',
            },
            {
                title: '榜单与集合',
                docs: 'https://docs.rsshub.app/routes/social-media#douban',
                source: ['/subject_collection/:type'],
                target: '/douban/list/:type',
            },
        ],
        jobs: [
            {
                title: '社会招聘',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/jobs/social',
                target: '/jobs/social',
            },
            {
                title: '校园招聘',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/jobs/campus',
                target: '/jobs/campus',
            },
            {
                title: '实习生招聘',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/jobs/intern',
                target: '/jobs/intern',
            },
        ],
        book: [
            {
                title: '读书论坛',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-ban',
                source: '/:id/discussion',
                target: '/:id/discussion',
            },
        ],
    },
};
