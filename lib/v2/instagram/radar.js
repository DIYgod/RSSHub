module.exports = {
    'instagram.com': {
        _name: 'Instagram',
        www: [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/routes/social-media#instagram',
                source: ['/:id'],
                target: '/instagram/user/:id',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/social-media#instagram',
                source: ['/explore/tags/:key'],
                target: '/instagram/tags/:key',
            },
        ],
    },
};
