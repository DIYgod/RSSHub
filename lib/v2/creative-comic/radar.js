module.exports = {
    'creative-comic.tw': {
        _name: 'CCC 創作集',
        '.': [
            {
                title: '漫畫',
                docs: 'https://docs.rsshub.app/anime.html#ccc-chuang-zuo-ji',
                source: ['/book/:id/*'],
                target: '/creative-comic/:id',
            },
        ],
    },
};
