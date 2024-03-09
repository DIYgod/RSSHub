export default {
    'creative-comic.tw': {
        _name: 'CCC 創作集',
        '.': [
            {
                title: '漫畫',
                docs: 'https://docs.rsshub.app/routes/anime#ccc-chuang-zuo-ji',
                source: ['/book/:id/*'],
                target: '/creative-comic/:id',
            },
        ],
    },
};
