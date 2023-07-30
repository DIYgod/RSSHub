module.exports = {
    'rawkuma.com': {
        _name: 'Rawkuma',
        '.': [
            {
                title: 'Manga',
                docs: 'https://docs.rsshub.app/anime.html#rawkuma-manga',
                source: ['/manga/:id', '/'],
                target: '/rawkuma/manga/:id',
            },
        ],
    },
};
