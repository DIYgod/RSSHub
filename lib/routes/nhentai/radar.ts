export default {
    'nhentai.net': {
        _name: 'nhentai',
        '.': [
            {
                title: '分类筛选',
                docs: 'https://docs.rsshub.app/routes/anime#nhentai',
                source: ['/:key/:keyword'],
                target: '/nhentai/:key/:keyword',
            },
            {
                title: '高级搜索',
                docs: 'https://docs.rsshub.app/routes/anime#nhentai',
                source: ['/search'],
                target: (_, url) => `/nhentai/search/${new URL(url).searchParams.get('q')}`,
            },
        ],
    },
};
