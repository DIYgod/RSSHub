module.exports = {
    'acfun.cn': {
        _name: 'AcFun',
        www: [
            {
                title: '番剧',
                docs: 'https://docs.rsshub.app/anime.html#acfun-fan-ju',
                source: '/bangumi/:id',
                target: (params) => `/acfun/bangumi/${params.id.replace('aa', '')}`,
            },
            {
                title: '用户投稿',
                docs: 'https://docs.rsshub.app/anime.html#acfun-yong-hu-tou-gao',
                source: '/u/:id',
                target: '/acfun/user/video/:id',
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/anime.html#acfun',
                source: '/v/:categoryId/index.htm',
                target: (params) => `/acfun/article/${params.categoryId.replace('list', '')}`,
            },
        ],
    },
};
