module.exports = {
    '163.com': {
        _name: '网易',
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
                docs: 'https://docs.rsshub.app/.html#',
                source: ['/:category', '/'],
                target: '//:category?',
            },
        ],
    },
};
