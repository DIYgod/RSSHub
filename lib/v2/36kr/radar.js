module.exports = {
    '36kr.com': {
        _name: '36kr',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr',
                source: '/',
                target: '/36kr/news',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr',
                source: '/',
                target: '/36kr/newsflashes',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr',
                source: '/user/:uid',
                target: '/36kr/user/:uid',
            },
            {
                title: '主题文章',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr',
                source: '/motif/:mid',
                target: '/36kr/motif/:mid',
            },
            {
                title: '搜索文章',
                docs: 'https://docs.rsshub.app/new-media.html#_36kr',
                source: '/search/articles/:keyword',
                target: '/36kr/search/article/:keyword',
            },
        ],
    },
};
