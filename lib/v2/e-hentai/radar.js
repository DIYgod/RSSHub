module.exports = {
    'e-hentai.org': {
        _name: 'E-Hentai',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#e-hentai-fen-lei',
                source: ['/:category', '/'],
                target: '/e-hentai/category/:category?',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/multimedia.html#e-hentai-biao-qian',
                source: ['/tag/:tag', '/'],
                target: '/e-hentai/tag/:tag?',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/multimedia.html#e-hentai-sou-suo',
                source: ['/:keyword', '/'],
                target: '/e-hentai/search/:keyword?',
            },
        ],
    },
};
