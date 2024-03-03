export default {
    'threads.net': {
        _name: 'Threads',
        '.': [
            {
                title: 'User timeline',
                docs: 'https://docs.rsshub.app/routes/social-media#threads',
                source: ['/:user'],
                target: (params) => `/threads/${params.user.substring(1)}`,
            },
        ],
    },
};
