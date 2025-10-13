module.exports = {
    'dribbble.com': {
        _name: 'Dribbble',
        '.': [
            {
                title: 'Keyword',
                docs: 'https://docs.rsshub.app/routes/design#dribbble',
                source: ['/search/shots/recent'],
                target: (_, url) => `/dribbble/keyword/${new URL(url).searchParams.get('q')}`,
            },
            {
                title: 'Popular',
                docs: 'https://docs.rsshub.app/routes/design#dribbble',
                source: ['/'],
                target: '/dribbble/popular',
            },
            {
                title: 'User (or team)',
                docs: 'https://docs.rsshub.app/routes/design#dribbble',
                source: ['/:name'],
                target: '/dribbble/user/:name',
            },
        ],
    },
};
