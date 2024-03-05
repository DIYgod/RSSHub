export default {
    'freebuf.com': {
        _name: 'Freebuf',
        '.': [
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/routes/blog#freebuf',
                source: ['/articles/:type/*.html', '/articles/:type'],
                target: '/freebuf/articles/:type',
            },
        ],
    },
};
