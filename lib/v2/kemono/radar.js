module.exports = {
    'kemono.party': {
        _name: 'Kemono',
        '.': [
            {
                title: 'Posts',
                docs: 'https://docs.rsshub.app/routes/anime#kemono-posts',
                source: ['/:source/user/:id', '/'],
                target: '/kemono/:source?/:id?',
            },
        ],
    },
};
