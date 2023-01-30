module.exports = {
    'hljucm.net': {
        _name: '黑龙江中医药大学',
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#hei-long-jiang-zhong-yi-yao-da-xue',
                source: ['/index/:category', '/index'],
                target: (params) => `/hljucm/yjsy/${params.category.replace('.htm', '')}`,
            },
        ],
    },
};
