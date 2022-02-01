module.exports = {
    'github.com': {
        _name: 'GitHub',
        '.': [
            {
                title: 'Issues / Pull Requests 评论',
                docs: 'https://docs.rsshub.app/programming.html#github',
                source: ['/:user/:repo/:type/:number'],
                target: '/github/comments/:user/:repo/:type/:number',
            },
        ],
    },
};
