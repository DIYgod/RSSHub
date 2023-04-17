module.exports = {
    'arknights.jp': {
        _name: '明日方舟',
        ak: [
            {
                title: 'アークナイツ（日服新闻）',
                docs: 'https://docs.rsshub.app/game.html#ming-ri-fang-zhou',
                source: ['/news', '/'],
                target: '/arknights/japan',
            },
        ],
    },
    'hypergryph.com': {
        _name: '明日方舟',
        ak: [
            {
                title: '游戏公告与新闻',
                docs: 'https://docs.rsshub.app/game.html#ming-ri-fang-zhou',
                source: ['/news.html', '/'],
                target: '/arknights/news',
            },
        ],
        'ak-conf': [
            {
                title: '游戏内公告',
                docs: 'https://docs.rsshub.app/game.html#ming-ri-fang-zhou',
                source: ['/*'],
                target: '/arknights/news',
            },
        ],
        'monster-siren': [
            {
                title: '塞壬唱片',
                docs: 'https://docs.rsshub.app/game.html#ming-ri-fang-zhou',
                source: ['/info', '/'],
                target: '/siren/news',
            },
        ],
    },
};
