export default {
    'literotica.com': {
        _name: 'Literotica',
        '.': [
            {
                title: 'New Stories',
                docs: 'https://docs.rsshub.app/routes/reading#literotica-new-stories',
                source: ['/'],
                target: '/literotica/new',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/reading#literotica-category',
                source: ['/c/:category', '/'],
                target: '/literotica/category/:category',
            },
        ],
    },
};
