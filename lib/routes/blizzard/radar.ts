export default {
    'blizzard.com': {
        _name: 'Blizzard',
        news: [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/game#blizzard',
                source: ['/:language/:category?', '/:language'],
                target: '/blizzard/news/:language/:category?',
            },
        ],
    },
};
