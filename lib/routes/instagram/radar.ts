export default {
    'instagram.com': {
        _name: 'Instagram',
        www: [
            {
                title: 'User',
                docs: 'https://docs.rsshub.app/routes/social-media#instagram',
                source: ['/:id'],
                target: '/instagram/user/:id',
            },
            {
                title: 'Tags',
                docs: 'https://docs.rsshub.app/routes/social-media#instagram',
                source: ['/explore/tags/:key'],
                target: '/instagram/tags/:key',
            },
        ],
    },
};
