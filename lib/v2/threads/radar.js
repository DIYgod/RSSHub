module.exports = {
    'threads.net': {
        _name: 'Threads',
        '.': [
            {
                title: 'User timeline',
                docs: 'https://docs.rsshub.app/en/social-media.html#threads',
                source: ['/:user'],
                target: (params) => `/threads/${params.user.substring(1)}`,
            },
        ],
    },
};
