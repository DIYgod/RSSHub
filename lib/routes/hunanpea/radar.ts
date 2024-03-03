export default {
    'hunanpea.com': {
        _name: '湖南人事考试网',
        rsks: [
            {
                title: '公告',
                docs: 'https://docs.rsshub.app/routes/study#hu-nan-ren-shi-kao-shi-wang',
                source: ['/Category/:guid/ArticlesByCategory.do'],
                target: '/hunanpea/rsks/:guid',
            },
        ],
    },
};
