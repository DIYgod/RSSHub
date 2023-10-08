module.exports = {
    'grist.org': {
        _name: 'Grist',
        '.': [
            {
                title: 'Articles',
                docs: 'https://docs.rsshub.app/routes/new-media#grist',
                source: ['/articles/'],
                target: '/grist/',
            },
            {
                title: 'Featured',
                docs: 'https://docs.rsshub.app/routes/new-media#grist',
                source: '/',
                target: '/grist/featured',
            },
            {
                title: 'Series',
                docs: 'https://docs.rsshub.app/routes/new-media#grist',
                source: '/series/:series',
                target: '/grist/series/:series',
            },
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/routes/new-media#grist',
                source: ['/:topic'],
                target: '/grist/topic/:topic',
            },
        ],
    },
};
