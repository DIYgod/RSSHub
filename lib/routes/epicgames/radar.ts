export default {
    'epicgames.com': {
        _name: 'Epic Games Store',
        store: [
            {
                title: '免费游戏',
                docs: 'https://docs.rsshub.app/routes/game#epic-games-store',
                source: ['/:locale/free-games'],
                target: '/epicgames/freegames/:locale',
            },
        ],
    },
};
