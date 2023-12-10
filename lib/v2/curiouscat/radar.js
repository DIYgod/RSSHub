module.exports = {
    'curiouscat.live': {
        _name: 'CuriousCat',
        '.': [
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/routes/en/social-media#curiouscat',
                source: ['/:id'],
                target: '/curiouscat/user/:id',
            },
        ],
    },
};
