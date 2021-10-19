module.exports = {
    'literotica.com': {
        _name: 'Literotica',
        '.': [
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/reading.html#literotica-category',
                source: ['/c/:category', '/'],
                target: '/literotica/category/:category',
            },
        ],
    },
};
