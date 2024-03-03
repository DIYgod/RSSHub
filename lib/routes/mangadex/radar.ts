export default {
    'mangadex.org': {
        _name: 'MangaDex',
        '.': [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/routes/anime#mangadex',
                source: ['/title/:id/*', '/title/:id'],
                target: '/mangadex/:id',
            },
        ],
    },
};
