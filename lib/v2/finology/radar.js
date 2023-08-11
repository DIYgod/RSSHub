module.exports = {
    'insider.finology.in': {
        _name: 'Insider by Finology',
        '.': [
            {
                title: 'Bullets',
                docs: 'https://docs.rsshub.app/en/new-media.html#grist',
                source: ['/bullets'],
                target: '/finology/bullets',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/en/new-media.html#grist',
                source: '/:category',
                target: '/finology/:category',
            },
            {
                title: 'Most Viewed',
                docs: 'https://docs.rsshub.app/en/new-media.html#grist',
                source: '/most-viewed',
                target: '/finology/most-viewed/monthly',
            },
            {
                title: 'Trending Topic',
                docs: 'https://docs.rsshub.app/en/new-media.html#grist',
                source: ['/tag/:topic'],
                target: '/finology/tag/:topic',
            },
        ],
    },
};
