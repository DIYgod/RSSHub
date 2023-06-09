module.exports = {
    'pikabu.ru': {
        _name: 'Pikabu',
        '.': [
            {
                title: 'Community',
                docs: 'https://docs.rsshub.app/en/bbs.html#pikabu',
                source: ['/community/:name'],
                target: '/pikabu/community/:name',
            },
            {
                title: 'Tag',
                docs: 'https://docs.rsshub.app/en/bbs.html#pikabu',
                source: ['/tag/:name'],
                target: '/pikabu/tag/:name',
            },
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/en/bbs.html#pikabu',
                source: ['/:name'],
                target: '/pikabu/user/:name',
            },
        ],
    },
};
