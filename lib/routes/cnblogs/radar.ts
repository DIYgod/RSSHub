export default {
    'cnblogs.com': {
        _name: '博客园',
        www: [
            {
                title: '10天推荐排行榜',
                docs: 'https://docs.rsshub.app/routes/blog#博客园',
                source: ['/aggsite/topdiggs'],
                target: '/cnblogs/aggsite/topdiggs',
            },
            {
                title: '48小时阅读排行',
                docs: 'https://docs.rsshub.app/routes/blog#博客园',
                source: ['/aggsite/topviews'],
                target: '/cnblogs/aggsite/topviews',
            },
            {
                title: '编辑推荐',
                docs: 'https://docs.rsshub.app/routes/blog#博客园',
                source: ['/aggsite/headline'],
                target: '/cnblogs/aggsite/headline',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/blog#博客园',
                source: ['/cate/:type'],
                target: '/cnblogs/cate/:type',
            },
            {
                title: '精华区',
                docs: 'https://docs.rsshub.app/routes/blog#博客园',
                source: ['/pick'],
                target: '/cnblogs/pick',
            },
        ],
    },
};
