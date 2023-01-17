module.exports = {
    'mangadex.org': {
        _name: 'MangaDex',
        '.': [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/anime.html#mangadex',
                source: ['/title/:id/*', '/title/:id'],
                target: '/mangadex/:id',
            },
        ],
    },
};
