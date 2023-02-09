module.exports = {
    'u9a9.com': {
        _name: 'U9A9',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/multimedia.html#u9a9',
                source: ['/'],
                target: '/u9a9',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/multimedia.html#u9a9',
                source: ['/'],
                target: (_, url) => `/u9a9/search/${new URL(url).searchParams.get('search')}`,
            },
        ],
    },
};
