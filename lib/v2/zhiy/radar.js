module.exports = {
    'zhiy.cc': {
        _name: '知园',
        '.': [
            {
                title: 'Newsletter',
                docs: 'https://docs.rsshub.app/new-media.html#zhi-yuan',
                source: ['/:author'],
                target: '/zhiy/letters/:author',
            },
            {
                title: '笔记',
                docs: 'https://docs.rsshub.app/new-media.html#zhi-yuan',
                source: ['/:author'],
                target: '/zhiy/posts/:author',
            },
        ],
    },
};
