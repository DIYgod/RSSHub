module.exports = {
    'nodeseek.com': {
        _name: 'NodeSeek',
        '.': [
            {
                title: '新帖子',
                docs: 'https://docs.rsshub.app/bbs#nodeseek',
                source: ['/?sortBy=postTime', '/'],
                target: '/nodeseek/post/new',
            },
            {
                title: '版块',
                docs: 'https://docs.rsshub.app/bbs#nodeseek',
                source: ['/categories/:category'],
                target: (params) => `/nodeseek/categories/${params.category}`,
            },
        ],
    },
};
