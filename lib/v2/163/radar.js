const dy2 = {
    title: '网易号（通用）',
    docs: 'https://docs.rsshub.app/new-media.html#wang-yi-hao',
    source: ['/dy/media/:id', '/news/sub/:id'],
    target: (params) => `/163/dy2/${params.id.replace('.html', '')}`,
};

module.exports = {
    '163.com': {
        _name: '网易',
        '.': [dy2],
        '3g': [
            dy2,
            {
                title: '独家栏目',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-du-jia-lan-mu',
                source: ['/touch/exclusive/sub/:id'],
                target: '/163/exclusive/:id?',
            },
        ],
        'c.m': [dy2],
        ds: [
            {
                title: '大神',
                docs: 'https://docs.rsshub.app/game.html#wang-yi-da-shen',
                source: '/user/:id',
                target: '/163/ds/:id',
            },
        ],
        m: [
            {
                title: '今日关注',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-jin-ri-guan-zhu',
                source: ['/'],
                target: '/163/today',
            },
        ],
        news: [
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-pai-hang-bang',
            },
        ],
        renjian: [
            {
                title: '人间',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-ren-jian',
                source: ['/:category', '/'],
                target: '/163/renjian/:category?',
            },
        ],
        'vip.open': [
            {
                title: '公开课 精品课程',
                docs: 'https://docs.rsshub.app/study.html#wang-yi-gong-kai-ke',
                source: ['/'],
                target: '/163/open/vip',
            },
        ],
        'wp.m': [
            {
                title: '今日关注',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-xin-wen',
                source: ['/163/html/newsapp/todayFocus/index.html', '/'],
                target: '/163/today',
            },
        ],
    },
};
