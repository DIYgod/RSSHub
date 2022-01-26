module.exports = {
    'wallstreetcn.com': {
        _name: '华尔街见闻',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/traditional-media.html#hua-er-jie-jian-wen-zi-xun',
                source: ['/news/:category', '/'],
                target: '/wallstreetcn/news/:category?',
            },
            {
                title: '实时快讯',
                docs: 'https://docs.rsshub.app/traditional-media.html#hua-er-jie-jian-wen-shi-shi-kuai-xun',
                source: ['/live/:category', '/'],
                target: '/wallstreetcn/live/:category?',
            },
        ],
    },
};
