module.exports = {
    'filmdeepfocus.com': {
        _name: '深焦',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#shen-jiao-fen-lei',
                source: ['/:category', '/'],
                target: '/filmdeepfocus/:category?',
            },
        ],
    },
};
