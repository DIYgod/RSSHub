module.exports = {
    'hacking8.com': {
        _name: 'Hacking8',
        '.': [
            {
                title: '信息流',
                docs: 'https://docs.rsshub.app/programming.html#hacking8-xin-xi-liu',
                source: ['/index/:category', '/'],
                target: '/hacking8/:category?',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/programming.html#hacking8-sou-suo',
                source: ['/search', '/'],
                target: (params, url) => `/hacking8/search/${new URL(url).searchParams.get('q')}`,
            },
        ],
    },
};
