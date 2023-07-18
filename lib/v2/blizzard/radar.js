module.exports = {
    'blizzard.com': {
        _name: 'Blizzard',
        news: [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/game.html#blizzard',
                source: ['/:language/:category?', '/:language'],
                target: '/blizzard/news/:language/:category?',
            },
        ],
    },
};
