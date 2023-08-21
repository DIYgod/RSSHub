module.exports = {
    'nodeseek.com': {
        _name: 'NodeSeek',
        '.': [
            {
                title: '新帖子',
                docs: 'https://docs.rsshub.app/bbs#nodeseek-post-new',
                source: ['/?sortBy=postTime', '/'],
                target: '/post/new',
            },
            {
                title: '版块',
                docs: 'https://docs.rsshub.app/bbs#nodeseek-categories',
                source: ['/categories/:category'],
                target: (params) => `/categories/${params.category}`,
            },
        ],
    },
};
