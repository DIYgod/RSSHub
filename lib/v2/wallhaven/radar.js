module.exports = {
    'wallhaven.cc': {
        _name: 'wallhaven',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/picture.html#wallhaven-fen-lei',
                source: ['/:category', '/'],
                target: '/wallhaven/:category/:needDetails?',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/picture.html#wallhaven-sou-suo',
                source: ['/search', '/'],
                target: '/wallhaven/:filter?/:needDetails?',
            },
        ],
    },
};
