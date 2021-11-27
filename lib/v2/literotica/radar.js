module.exports = {
    'literotica.com': {
        _name: 'Literotica',
        '.': [
            {
                title: 'New Stories',
                docs: 'https://docs.rsshub.app/reading.html#literotica-new-stories',
                source: ['/'],
                target: '/literotica/new',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/reading.html#literotica-category',
                source: ['/c/:category', '/'],
                target: '/literotica/category/:category',
            },
        ],
    },
};
