module.exports = {
    'bitbucket.com': {
        _name: 'Bitbucket',
        '.': [
            {
                title: 'Commits',
                docs: 'https://docs.rsshub.app/programming.html#bitbucket',
                source: ['/commits/:workspace/:repo_slug'],
                target: '/bitbucket/commits/:workspace/:repo_slug',
            },
            {
                title: 'Tags',
                docs: 'https://docs.rsshub.app/programming.html#bitbucket',
                source: ['/tags/:workspace/:repo_slug'],
                target: '/bitbcuket/tags/:workspace/:repo_slug',
            },
        ],
    },
};
