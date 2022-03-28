module.exports = {
    'nodejs.org': {
        _name: 'Node.js',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/programming.html#nodejs-news',
                source: ['/:language/blog', '/'],
                target: '/nodejs/blog/:language?',
            },
        ],
    },
};
