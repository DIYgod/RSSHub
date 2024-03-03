export default {
    'dlnews.com': {
        _name: 'DL NEWS',
        '.': [
            {
                title: 'All Articles',
                docs: 'https://docs.rsshub.app/routes/finance#dl-news',
                source: ['/articles/'],
                target: '/dlnews/',
            },
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/routes/finance#dl-news',
                source: ['/articles/:category'],
                target: '/dlnews/:category',
            },
        ],
    },
};
