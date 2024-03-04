export default {
    'rawkuma.com': {
        _name: 'Rawkuma',
        '.': [
            {
                title: 'Manga',
                docs: 'https://docs.rsshub.app/routes/anime#rawkuma-manga',
                source: ['/manga/:id', '/'],
                target: '/rawkuma/manga/:id',
            },
        ],
    },
};
