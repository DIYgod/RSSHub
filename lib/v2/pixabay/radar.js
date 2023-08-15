module.exports = {
    'pixabay.com': {
        _name: 'Pixabay',
        '.': [
            {
                title: 'Search',
                docs: 'https://docs.rsshub.app/routes/en/picture#pixabay',
                source: ['/:searchType/search/:q'],
                target: '/pixabay/search/:q',
            },
        ],
    },
};
