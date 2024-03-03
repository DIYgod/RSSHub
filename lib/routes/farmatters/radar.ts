export default {
    'farmatters.com': {
        _name: 'Farmatters',
        '.': [
            {
                title: 'Viewpoint',
                docs: 'https://docs.rsshub.app/routes/new-media#farmatters-viewpoint',
                source: ['/news'],
                target: '/farmatters/news',
            },
            {
                title: 'Exclusive',
                docs: 'https://docs.rsshub.app/routes/new-media#farmatters-exclusive',
                source: ['/exclusive'],
                target: '/farmatters/exclusive',
            },
            {
                title: 'Tag',
                docs: 'https://docs.rsshub.app/routes/new-media#farmatters-tag',
                source: ['/tag/:id', '/:locale/tag/:id'],
                target: (params) => {
                    const id = params.id;
                    const locale = params.locale;

                    return `/farmatters/tag${id ? `/${id}${locale ? `/${locale}` : ''}` : ''}`;
                },
            },
            {
                title: 'Wiki',
                docs: 'https://docs.rsshub.app/routes/new-media#farmatters-wiki',
                source: ['/wiki'],
                target: '/farmatters/wiki',
            },
        ],
    },
};
