module.exports = {
    'kuwaitlocal.com': {
        _name: 'Kuwait Local',
        '.': [
            {
                title: 'Latest News',
                docs: 'https://docs.rsshub.app/routes/en/new-media#kuwait-local',
                source: ['/news/latest', '/news', '/'],
                target: '/kuwaitlocal',
            },
            {
                title: 'Categorised News',
                docs: 'https://docs.rsshub.app/routes/en/new-media#kuwait-local',
                source: ['/news/categories/:category'],
                target: '/kuwaitlocal/:category',
            },
        ],
    },
};
