module.exports = {
    'mygopen.com': {
        _name: 'MyGoPen',
        '.': [
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/new-media.html#mygopen-fen-lei',
                source: ['/search/label/:label', '/'],
                target: '/mygopen/:label?',
            },
        ],
    },
};
