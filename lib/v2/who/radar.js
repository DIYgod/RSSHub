module.exports = {
    'who.int': {
        _name: '世界卫生组织 WHO',
        '.': [
            {
                title: '新闻稿',
                docs: 'https://docs.rsshub.app/government.html#shi-jie-wei-sheng-zu-zhi-who',
                source: '/news',
                target: '/who/news',
            },
            {
                title: '媒体中心',
                docs: 'https://docs.rsshub.app/government.html#shi-jie-wei-sheng-zu-zhi-who',
                source: '/news-room/:type',
                target: '/who/news-room/:type',
            },
            {
                title: '总干事的讲话',
                docs: 'https://docs.rsshub.app/government.html#shi-jie-wei-sheng-zu-zhi-who',
                source: '/director-general/speeches',
                target: '/who/speeches',
            },
        ],
    },
};
