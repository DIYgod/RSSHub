module.exports = {
    'learnblockchain.cn': {
        _name: '登链社区',
        '.': [
            {
                title: '分类文章',
                docs: 'https://docs.rsshub.app/programming.html#deng-lian-she-qu-wen-zhang',
                source: '/categories/:cid/:sort?',
                target: (params) => `/learnblockchain/posts/${params.cid || 'all'}/${params.sort || 'featured'}`,
            },
            {
                title: '全部文章',
                docs: 'https://docs.rsshub.app/programming.html#deng-lian-she-qu-wen-zhang',
                source: '*',
                target: () => '/learnblockchain/posts/all/',
            },
        ],
    },
};
