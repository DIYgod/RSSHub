module.exports = {
    'yxrb.net': {
        _name: '游戏日报',
        news: [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/game.html#you-xi-ri-bao',
                source: ['/:category', '/'],
                target: '/yxrb/:category',
            },
        ],
    },
};
