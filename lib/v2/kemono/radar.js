module.exports = {
    'kemono.party': {
        _name: 'Kemono',
        '.': [
            {
                title: 'Posts',
                docs: 'https://docs.rsshub.app/anime.html#kemono-posts',
                source: ['/:source/user/:id', '/'],
                target: '/kemono/:source?/:id?',
            },
        ],
    },
};
