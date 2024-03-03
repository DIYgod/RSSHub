export default {
    'finology.in': {
        _name: 'Finology Insider',
        insider: [
            {
                title: 'Bullets',
                docs: 'https://docs.rsshub.app/routes/finance#finology-insider',
                source: ['/bullets'],
                target: '/finology/bullets',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/finance#finology-insider',
                source: '/:category',
                target: '/finology/:category',
            },
            {
                title: 'Most Viewed',
                docs: 'https://docs.rsshub.app/routes/finance#finology-insider',
                source: '/most-viewed',
                target: '/finology/most-viewed/monthly',
            },
            {
                title: 'Trending Topic',
                docs: 'https://docs.rsshub.app/routes/finance#finology-insider',
                source: ['/tag/:topic'],
                target: '/finology/tag/:topic',
            },
        ],
    },
};
