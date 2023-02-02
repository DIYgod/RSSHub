module.exports = {
    'eleduck.com': {
        _name: '电鸭社区',
        '.': [
            {
                title: '工作机会',
                docs: 'https://docs.rsshub.app/bbs.html#dian-ya-she-qu-fen-lei-wen-zhang',
                source: ['/categories/5', '/'],
                target: '/eleduck/jobs',
            },
            {
                title: '分类文章',
                docs: 'https://docs.rsshub.app/bbs.html#dian-ya-she-qu-fen-lei-wen-zhang',
                source: '/categories/:cid',
                target: (params) => `/eleduck/posts${params.cid}`,
            },
            {
                title: '全部文章',
                docs: 'https://docs.rsshub.app/bbs.html#dian-ya-she-qu-fen-lei-wen-zhang',
                source: '*',
                target: () => '/eleduck/posts',
            },
        ],
    },
};
