module.exports = {
    'eleduck.com': {
        _name: '电鸭社区',
        '.': [{
                title: '分类文章',
                docs: 'https://docs.rsshub.app/bbs.html#dian-ya-she-qu-fen-lei-wen-zhang',
                source: '/categories/:cid',
                target: (params) => {
                    return `/eleduck/posts${params.cid}`;
                },
            },
            {
                title: '全部文章',
                docs: 'https://docs.rsshub.app/bbs.html#dian-ya-she-qu-fen-lei-wen-zhang',
                source: '*',
                target: () => {
                    return '/eleduck/posts';
                },
            }

        ],
    },
};
