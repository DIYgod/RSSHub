export default {
    'comicskingdom.com': {
        _name: 'Comics Kingdom',
        '.': [
            {
                title: 'Archive',
                docs: 'https://docs.rsshub.app/routes/anime#comics-kingdom',
                source: ['/:name/*', '/:name'],
                target: '/comicskingdom/:name',
            },
        ],
    },
};
