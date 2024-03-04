export default {
    'mygopen.com': {
        _name: 'MyGoPen',
        '.': [
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/routes/new-media#mygopen-fen-lei',
                source: ['/search/label/:label', '/'],
                target: '/mygopen/:label?',
            },
        ],
    },
};
