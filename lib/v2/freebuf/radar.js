module.exports = {
    'freebuf.com': {
        _name: 'Freebuf',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/blog.html#freebuf',
                source: ['/articles/:type/*.html', '/articles/:type'],
                target: '/freebuf/articles/:type',
            },
        ],
    },
};
