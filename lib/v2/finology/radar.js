module.exports = {
    'insider.finology.in': {
        _name: 'Insider by Finology',
        '.': [
            {
                title: 'Bullets',
                docs: 'https://docs.rsshub.app/en/finance.html#insider-by-finology',
                source: ['/bullets'],
                target: '/finology/bullets',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/en/finance.html#insider-by-finology',
                source: '/:category',
                target: '/finology/:category',
            },
            {
                title: 'Most Viewed',
                docs: 'https://docs.rsshub.app/en/finance.html#insider-by-finology',
                source: '/most-viewed',
                target: '/finology/most-viewed/monthly',
            },
            {
                title: 'Trending Topic',
                docs: 'https://docs.rsshub.app/en/finance.html#insider-by-finology',
                source: ['/tag/:topic'],
                target: '/finology/tag/:topic',
            },
        ],
    },
};
