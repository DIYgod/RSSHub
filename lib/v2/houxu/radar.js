module.exports = {
    'houxu.app': {
        _name: '后续',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#hou-xu-fen-lei',
                source: ['/:category', '/'],
                target: '/houxu/:category?',
            },
            {
                title: 'Lives',
                docs: 'https://docs.rsshub.app/new-media.html#hou-xu-lives',
                source: ['/lives/:id', '/'],
                target: '/houxu/lives/:id',
            },
        ],
    },
};
