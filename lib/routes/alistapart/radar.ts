export default {
    'alistapart.com': {
        _name: 'A List Apart',
        '.': [
            {
                title: 'Articles',
                docs: 'https://docs.rsshub.app/routes/programming#a-list-apart',
                source: ['/articles/'],
                target: '/alistapart',
            },
            {
                title: 'Topics',
                docs: 'https://docs.rsshub.app/routes/programming#a-list-apart',
                source: ['/blog/topic/:topic'],
                target: '/alistapart/:topic',
            },
        ],
    },
};
