module.exports = {
    'smashingmagazine.com': {
        _name: 'Smashing Magazine',
        '.': [
            {
                title: 'Articles',
                docs: 'https://docs.rsshub.app/routes/en/programming#a-list-apart',
                source: ['/articles/'],
                target: '/smashingmagazine',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/en/programming#a-list-apart',
                source: ['/category/:category'],
                target: '/smashingmagazine/:category',
            },
        ],
    },
};
