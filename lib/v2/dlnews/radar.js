module.exports = {
    'dlnews.com': {
        _name: 'DL NEWS',
        '.': [
            {
                title: 'All Articles',
                docs: 'https://docs.rsshub.app/routes/new-media#dl-news',
                source: ['/articles/'],
                target: '/dlnews/',
            },
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/routes/new-media#dl-news',
                source: ['/articles/:category'],
                target: '/dlnews/:category',
            },
        ],
    },
};
