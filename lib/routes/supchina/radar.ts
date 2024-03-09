export default {
    'supchina.com': {
        _name: 'SupChina',
        '.': [
            {
                title: 'Feed',
                docs: 'https://docs.rsshub.app/routes/new-media#supchina-feed',
                source: ['/feed', '/'],
                target: '/supchina',
            },
            {
                title: 'Podcasts',
                docs: 'https://docs.rsshub.app/routes/new-media#supchina-podcasts',
                source: ['/podcasts', '/'],
                target: '/supchina/podcasts',
            },
        ],
    },
};
