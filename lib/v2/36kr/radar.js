module.exports = {
    '36kr.com': {
        _name: '36氪',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr-zi-xun',
                source: ['/information/:category', '/'],
                target: '/36kr/information/:category',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr-kuai-xun',
                source: ['/newsflashes', '/'],
                target: '/36kr/newsflashes',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr-yong-hu-wen-zhang',
                source: ['/user/:id', '/'],
                target: '/36kr/user/:id',
            },
            {
                title: '主题文章',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr-zhu-ti-wen-zhang',
                source: ['/motif/:id', '/'],
                target: '/36kr/motif/:id',
            },
            {
                title: '专题文章',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr-zhuan-ti-wen-zhang',
                source: ['/topics/:id', '/'],
                target: '/36kr/topics/:id',
            },
            {
                title: '搜索文章',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr-sou-suo-wen-zhang',
                source: ['/search/articles/:keyword', '/'],
                target: '/36kr/search/articles/:keyword',
            },
            {
                title: '搜索快讯',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr-sou-suo-kuai-xun',
                source: ['/search/newsflashes/:keyword', '/'],
                target: '/36kr/search/newsflashes/:keyword',
            },
        ],
    },
};
