module.exports = {
    'threads.net': {
        _name: 'Threads',
        '.': [
            {
                title: 'User timeline',
                docs: 'https://docs.rsshub.app/social-media.html#threads',
                source: ['/@:user'],
                target: '/threads/:user',
            },
        ],
    },
};
