export default {
    'qoo-app.com': {
        _name: 'QooApp',
        apps: [
            {
                title: '遊戲庫 - 評論',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/app-comment/:id', '/app-comment/:id', '/app/:id'],
                target: (params) => `/qoo-app/apps${params.lang ? `/${params.lang}` : ''}/comment/:id`,
            },
            {
                title: '遊戲庫 - 情報',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/app-post/:id', '/app-post/:id', '/app/:id'],
                target: (params) => `/qoo-app/apps${params.lang ? `/${params.lang}` : ''}/post/:id`,
            },
            {
                title: '遊戲庫 - 筆記',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/app-note/:id', '/app-note/:id', '/app/:id'],
                target: (params) => `/qoo-app/apps${params.lang ? `/${params.lang}` : ''}/note/:id`,
            },
            {
                title: '遊戲庫 - 曬卡',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/app-card/:id', '/app-card/:id', '/app/:id'],
                target: (params) => `/qoo-app/apps${params.lang ? `/${params.lang}` : ''}/card/:id`,
            },
        ],
        news: [
            {
                title: '資訊',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang', '/'],
                target: (params) => `/qoo-app/news${params.lang ? `/${params.lang}` : ''}`,
            },
        ],
        notes: [
            {
                title: '筆記留言',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/note/:id', '/note/:id'],
                target: (params) => `/qoo-app/notes${params.lang ? `/${params.lang}` : ''}/note/:id`,
            },
            {
                title: '熱門話題',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/topic/:topic', '/topic/:topic'],
                target: (params) => `/qoo-app/notes${params.lang ? `/${params.lang}` : ''}/topic/:topic`,
            },
            {
                title: '用户筆記',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/user/:uid', '/user/:uid'],
                target: (params) => `/qoo-app/notes${params.lang ? `/${params.lang}` : ''}/user/:uid`,
            },
        ],
        user: [
            {
                title: '遊戲評論',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/:uid', '/:uid'],
                target: (params) => `/qoo-app/user${params.lang ? `/${params.lang}` : ''}/appComment/:uid`,
            },
            {
                title: '用户筆記',
                docs: 'https://docs.rsshub.app/routes/anime#qooapp',
                source: ['/:lang/:uid', '/:uid'],
                target: (params) => `/qoo-app/notes${params.lang ? `/${params.lang}` : ''}/user/:uid`,
            },
        ],
    },
};
