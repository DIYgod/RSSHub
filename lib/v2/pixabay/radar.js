module.exports = {
    'pixabay.com': {
        _name: 'Pixabay',
        '.': [
            {
                title: 'Search',
                docs: 'https://docs.rsshub.app/en/picture.html#pixabay',
                source: ['/:searchType/search/:q'],
                target: '/pixabay/search/:q',
            },
        ],
    },
};
