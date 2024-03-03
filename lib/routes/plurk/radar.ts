export default {
    'plurk.com': {
        _name: 'Plurk',
        '.': [
            {
                title: '話題',
                docs: 'https://docs.rsshub.app/routes/social-media#plurk',
                source: ['/topic/:topic'],
                target: '/plurk/topic/:topic',
            },
            {
                title: '話題排行榜',
                docs: 'https://docs.rsshub.app/routes/social-media#plurk',
                source: ['/top'],
                target: (_, url) => {
                    const hash = new URL(url).hash;
                    return `/plurk/top/${hash ? hash.slice(1) : 'topReplurks'}`;
                },
            },
            {
                title: '偷偷說',
                docs: 'https://docs.rsshub.app/routes/social-media#plurk',
                source: ['/anonymous'],
                target: '/plurk/anonymous',
            },
            {
                title: '搜尋',
                docs: 'https://docs.rsshub.app/routes/social-media#plurk',
                source: ['/search'],
                target: (_, url) => `/plurk/search/${new URL(url).searchParams.get('q')}`,
            },
            {
                title: '最近分享',
                docs: 'https://docs.rsshub.app/routes/social-media#plurk',
                source: ['/hotlinks'],
                target: '/plurk/hotlinks',
            },
            {
                title: '噗浪消息',
                docs: 'https://docs.rsshub.app/routes/social-media#plurk',
                source: ['/news'],
                target: '/plurk/news',
            },
            {
                title: '用戶',
                docs: 'https://docs.rsshub.app/routes/social-media#plurk',
                source: ['/:user'],
                target: (params) => {
                    if (params.user !== 'portal' && params.user !== 'top' && params.user !== 'anonymous' && params.user !== 'search' && params.user !== 'hotlinks' && params.user !== 'news') {
                        return `/plurk/user/${params.user}`;
                    }
                },
            },
        ],
    },
};
