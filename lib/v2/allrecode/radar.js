module.exports = {
    'allrecode.com': {
        _name: '重构',
        '.': [
            {
                title: '推荐',
                docs: 'https://docs.rsshub.app/news-media.html#chong-gou-tui-jian',
                source: ['/recommends', '/'],
                target: '/allrecode/recommends',
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/news-media.html#chong-gou-kuai-xun',
                source: ['/news', '/'],
                target: '/allrecode/news',
            },
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/news-media.html#chong-gou-zi-xun',
                source: ['/:category', '/'],
                target: '/allrecode/:category',
            },
        ],
    },
};
