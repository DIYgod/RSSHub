export default {
    'weibo.com': {
        _name: '微博',
        '.': [
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/routes/social-media#wei-bo',
                source: ['/u/:id', '/:id'],
                target: (params, url, document) => {
                    let uid = document?.documentElement.innerHTML.match(/\$CONFIG\['oid']='(\d+)'/)?.[1];
                    if (!uid && !Number.isNaN(params.id)) {
                        uid = params.id;
                    }
                    return uid ? `/weibo/user/${uid}` : '';
                },
            },
            {
                title: '关键词',
                docs: 'https://docs.rsshub.app/routes/social-media#wei-bo',
            },
            {
                title: '超话',
                docs: 'https://docs.rsshub.app/routes/social-media#wei-bo',
                source: '/p/:id/super_index',
                target: '/weibo/super_index/:id',
            },
            {
                title: '最新关注时间线',
                docs: 'https://docs.rsshub.app/routes/social-media#wei-bo',
                source: '/',
                target: '/weibo/friends',
            },
        ],
        s: [
            {
                title: '热搜榜',
                docs: 'https://docs.rsshub.app/routes/social-media#wei-bo',
                source: '/top/summary',
                target: '/weibo/search/hot/:fulltext?',
            },
        ],
    },
    'weibo.cn': {
        _name: '微博',
        m: [
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/routes/social-media#wei-bo',
                source: ['/u/:uid', '/profile/:uid'],
                target: '/weibo/user/:uid',
            },
        ],
    },
};
