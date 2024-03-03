export default {
    'nodejs.org': {
        _name: 'Node.js',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/programming#nodejs-news',
                source: ['/:language/blog', '/'],
                target: '/nodejs/blog/:language?',
            },
        ],
    },
};
