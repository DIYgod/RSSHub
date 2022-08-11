module.exports = {
    'coomer.party': {
        _name: 'Coomer',
        '.': [
            {
                title: 'Artist',
                docs: 'https://docs.rsshub.app/multimedia.html#coomer-artist',
                source: ['/onlyfans/user/:id', '/'],
                target: '/coomer/artist/:id',
            },
            {
                title: 'Recent Posts',
                docs: 'https://docs.rsshub.app/multimedia.html#coomer-recent-posts',
                source: ['/posts', '/'],
                target: '/coomer/posts',
            },
        ],
    },
};
