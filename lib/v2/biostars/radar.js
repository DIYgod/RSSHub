module.exports = {
    'biostars.org': {
        _name: 'biostars',
        '.': [
            {
                title: 'Biostars posts',
                docs: 'https://docs.rsshub.app/routes/programming#biostars-posts',
                source: ['/posts', '/'],
                target: '/biostars/posts',
            },
            {
                title: 'Biostars posts with tag',
                docs: 'https://docs.rsshub.app/routes/programming#biostars-tag',
                source: ['/tag/:tag', '/'],
                target: '/biostars/tag/:tag',
            },
        ],
    },
};
