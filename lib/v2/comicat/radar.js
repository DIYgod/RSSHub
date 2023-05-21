module.exports = {
    'comicat.org': {
        _name: 'Comicat',
        '.': [
            {
                title: '搜索关键词',
                docs: 'https://docs.rsshub.app/anime.html#Comicat',
                source: ['/search.php?keyword=*keyword'],
                target: (params) => `/comicat/search/${params.keyword}`,
            },
        ],
    },
};
