export default {
    'e-hentai.org': {
        _name: 'E-Hentai',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/multimedia#e-hentai-fen-lei',
                source: ['/:category', '/'],
                target: '/e-hentai/category/:category',
            },
            {
                title: '收藏',
                docs: 'https://docs.rsshub.app/routes/picture#e-hentai',
                source: ['/favorites.php', '/'],
                target: (_params, url) => `/ehentai/favorites/${new URL(url).searchParams.get('favcat')}`,
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/multimedia#e-hentai-biao-qian',
                source: ['/tag/:tag', '/'],
                target: '/e-hentai/tag/:tag',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/picture#e-hentai',
                source: ['/tag/:tag', '/'],
                target: '/ehentai/tag/:tag',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/multimedia#e-hentai-sou-suo',
                source: ['/:keyword', '/'],
                target: '/e-hentai/search/:keyword',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/picture#e-hentai',
                source: ['/'],
                target: (_params, url) => `/ehentai/search/${new URL(url).searchParams.get('f_search')}`,
            },
        ],
    },
};
