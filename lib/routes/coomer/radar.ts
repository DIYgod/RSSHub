export default {
    'coomer.party': {
        _name: 'Coomer',
        '.': [
            {
                title: 'Artist',
                docs: 'https://docs.rsshub.app/routes/multimedia#coomer-artist',
                source: ['/onlyfans/user/:id', '/'],
                target: '/coomer/artist/:id',
            },
            {
                title: 'Recent Posts',
                docs: 'https://docs.rsshub.app/routes/multimedia#coomer-recent-posts',
                source: ['/posts', '/'],
                target: '/coomer/posts',
            },
        ],
    },
};
