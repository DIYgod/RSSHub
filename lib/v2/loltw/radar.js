module.exports = {
    'garena.tw': {
        _name: 'Garena',
        lol: [
            {
                title: '英雄联盟台服新闻',
                docs: 'https://docs.rsshub.app/game.html#ying-xiong-lian-meng-tai-fu-xin-wen',
                source: ['/news/:category', '/news'],
                target: (params) => '/loltw/news/' + (params.category || ''),
            },
        ],
    },
};
