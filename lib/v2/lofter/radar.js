module.exports = {
    'lofter.com': {
        _name: 'Lofter',
        www: [
            {
                title: '话题 (标签)',
                docs: 'https://docs.rsshub.app/social-media.html#lofter',
                source: ['/tag/:name', '/tag/:name/:type'],
                target: (params) => `/lofter/tag/${params.name}/${params.type || ''}`,
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/social-media.html#lofter',
            },
        ],
    },
};
