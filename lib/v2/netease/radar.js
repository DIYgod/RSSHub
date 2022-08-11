module.exports = {
    '163.com': {
        _name: '网易',
        '': [
            {
                title: '独家栏目',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-du-jia-lan-mu',
                source: ['/'],
                target: '/netease/exclusive/:id?',
            },
        ],
        renjian: [
            {
                title: '人间',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-ren-jian',
                source: ['/:category', '/'],
                target: '/netease/renjian/:category?',
            },
        ],
        news: [
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-pai-hang-bang',
                source: ['/:category', '/'],
                target: '/netease/news/rank/:category?/:type?/:time?',
            },
        ],
        m: [
            {
                title: '今日关注',
                docs: 'https://docs.rsshub.app/new-media.html#wang-yi-xin-wen-jin-ri-guan-zhu',
                source: ['/'],
                target: '/netease/today/:need_content?',
            },
        ],
    },
};
