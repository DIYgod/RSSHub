module.exports = {
    'vocus.cc': {
        _name: '方格子',
        '.': [
            {
                title: '出版專題',
                docs: 'https://docs.rsshub.app/social-media.html#fang-ge-zi',
                source: ['/:id/home', '/:id/introduce'],
                target: '/vocus/publication/:id',
            },
            {
                title: '用户个人文章',
                docs: 'https://docs.rsshub.app/social-media.html#fang-ge-zi',
                source: ['/user/:id'],
                target: (params) => `/vocus/user/${params.id.replace('@', '')}`,
            },
        ],
    },
};
