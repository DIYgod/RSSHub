module.exports = {
    'hellogithub.com': {
        _name: 'HelloGitHub',
        '.': [
            {
                title: '文章列表',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub',
                source: ['/article', '/article/?url=/periodical/volume/'],
                target: '/hellogithub/article',
            },
            {
                title: '编程语言排行榜',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub',
                source: '/report/:type/?url=/periodical/volume/',
                target: '/hellogithub/ranking/:type',
            },
            {
                title: '月刊',
                docs: 'https://docs.rsshub.app/programming.html#hellogithub',
                source: '/periodical/volume/',
                target: '/hellogithub/month',
            },
        ],
    },
};
