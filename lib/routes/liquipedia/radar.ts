export default {
    'liquipedia.net': {
        _name: 'Liquipedia',
        '.': [
            {
                title: 'Counter Strike Match Results',
                docs: 'https://docs.rsshub.app/routes/game#liquipedia',
                source: ['/counterstrike/:id/Matches', '/dota2/:id'],
                target: '/liquipedia/counterstrike/matches/:id',
            },
            {
                title: 'Dota2 战队最近比赛结果',
                docs: 'https://docs.rsshub.app/routes/game#liquipedia',
                source: ['/dota2/:id'],
                target: '/liquipedia/dota2/matches/:id',
            },
        ],
    },
};
