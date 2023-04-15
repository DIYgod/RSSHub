module.exports = {
    'nintendo.com': {
        _name: 'Nintendo',
        '.': [
            {
                title: '直面会',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/nintendo-direct/archive', '/'],
                target: '/nintendo/direct',
            },
            {
                title: 'eShop 新发售游戏',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/store/games', '/'],
                target: '/nintendo/eshop/us',
            },
        ],
    },
    'nintendo.com.hk': {
        _name: 'Nintendo',
        '.': [
            {
                title: 'eShop 新发售游戏',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/software/switch', '/'],
                target: '/nintendo/eshop/hk',
            },
            {
                title: '首页资讯（香港）',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/topics', '/'],
                target: '/nintendo/news',
            },
        ],
    },
    'nintendo.co.jp': {
        _name: 'Nintendo',
        '.': [
            {
                title: 'eShop 新发售游戏',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/software/switch/index.html', '/'],
                target: '/nintendo/eshop/jp',
            },
            {
                title: 'Switch 本体更新情报（日本）',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/support/switch/system_update/index.html', '/'],
                target: '/nintendo/system-update',
            },
        ],
    },
    'nintendoswitch.com.cn': {
        _name: 'Nintendo',
        '.': [
            {
                title: 'eShop 新发售游戏',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/software', '/'],
                target: '/nintendo/eshop/cn',
            },
            {
                title: '首页资讯（中国）',
                docs: 'https://docs.rsshub.app/game.html#nintendo',
                source: ['/'],
                target: '/nintendo/news/china',
            },
        ],
    },
};
