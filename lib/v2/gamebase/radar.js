module.exports = {
    'gamebase.com.tw': {
        _name: 'Gamebase',
        '.': [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/game.html#gamebase-xin-wen',
                source: ['/news/:type', '/news/:type/:category', ''],
                target: '/gamebase/news/:type?/:category?',
            },
        ],
    },
};
