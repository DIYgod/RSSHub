module.exports = {
    'epicgames.com': {
        _name: 'Epic Games Store',
        store: [
            {
                title: '免费游戏',
                docs: 'https://docs.rsshub.app/game.html#epic-games-store',
                source: ['/:locale/free-games'],
                target: '/epicgames/freegames/:locale',
            },
        ],
    },
};
