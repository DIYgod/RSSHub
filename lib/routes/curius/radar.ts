export default {
    'curius.app': {
        _name: 'Curius',
        '.': [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/routes/social-media#curius',
                source: '/:name',
                target: '/curius/links/:name',
            },
        ],
    },
};
