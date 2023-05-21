module.exports = {
    'comicat.org': {
        _name: 'Comicat',
        '.': [
            {
                title: '搜索关键词',
                docs: 'https://docs.rsshub.app/anime#comicat',
                source: ['/search.php?keyword=:keyword'],
                target: '/comicat/search/:keyword',
            },
        ],
    },
};
