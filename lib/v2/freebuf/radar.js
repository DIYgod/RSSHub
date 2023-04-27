module.exports = {
    'freebuf.com': {
        _name: 'Freebuf',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/blog.html#freebuf',
                source: ['/articles/:type/:id?', '/articles/:type'],
                target: '/freebuf/articles/:type/:id?',
            },
        ],
    },
};
