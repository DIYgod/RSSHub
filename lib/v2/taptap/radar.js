module.exports = {
    'taptap.com': {
        _name: 'TapTap',
        '.': [
            {
                title: '游戏论坛',
                docs: 'https://docs.rsshub.app/game.html#taptap',
                source: ['/app/:id/topic', '/app/:id'],
                target: '/taptap/topic/:id',
            },
            {
                title: '游戏更新',
                docs: 'https://docs.rsshub.app/game.html#taptap',
                source: ['/app/:id'],
                target: '/taptap/changelog/:id',
            },
            {
                title: '游戏评价',
                docs: 'https://docs.rsshub.app/game.html#taptap',
                source: ['/app/:id/review', '/app/:id'],
                target: '/taptap/review/:id',
            },
        ],
    },
};
