export default {
    'pixabay.com': {
        _name: 'Pixabay',
        '.': [
            {
                title: 'Search',
                docs: 'https://docs.rsshub.app/routes/picture#pixabay',
                source: ['/:searchType/search/:q'],
                target: '/pixabay/search/:q',
            },
        ],
    },
};
