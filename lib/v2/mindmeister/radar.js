module.exports = {
    'mindmeister.com': {
        _name: 'MindMeister',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/study.html#mindmeister',
                source: ['/:language/mind-maps/:category', '/:language/:category', '/:category'],
                target: (params) => `/mindmeister/${params.category}${params.language ? `/${params.language}` : ''}`,
            },
        ],
    },
};
