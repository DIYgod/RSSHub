export default {
    '3dmgame.com': {
        _name: '3DMGame',
        '.': [
            {
                title: '新闻中心',
                docs: 'https://docs.rsshub.app/routes/game#3dmgame',
                source: ['/news/:category?', '/news'],
                target: '/3dmgame/news/:category?',
            },
            {
                title: '游戏资讯',
                docs: 'https://docs.rsshub.app/routes/game#3dmgame',
                source: ['/games/:name/:type'],
                target: '/3dmgame/:name/:type?',
            },
        ],
    },
};
