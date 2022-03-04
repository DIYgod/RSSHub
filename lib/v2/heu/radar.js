module.exports = {
    'hrbeu.edu.cn': {
        _name: '哈尔滨工程大学',
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/:id/list.htm',
                target: '/heu/yjsy/list/:id',
            },
        ],
        job: [
            {
                title: '大型招聘会',
                docs: 'https://docs.rsshub.app/journal.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/job/bigemploy',
            },
            {
                title: '今日招聘会',
                docs: 'https://docs.rsshub.app/journal.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/job/calendar',
            },
            {
                title: '就业服务平台-通知公告',
                docs: 'https://docs.rsshub.app/journal.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/job/list/tzgg',
            },
            {
                title: '就业服务平台-热点新闻',
                docs: 'https://docs.rsshub.app/journal.html#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/heu/job/list/rdxw',
            },
        ],
        news: [
            {
                title: '工学',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/:column',
                target: (params) => `/heu/gx/list/${params.column.replace('.htm', '')}`,
            },
            {
                title: '工学',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/:column/:id',
                target: (params) => `/heu/gx/list/${params.column}/${params.id.replace('.htm', '')}`,
            },
            {
                title: '工学-card',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/:column',
                target: (params) => `/heu/gx/card/${params.column.replace('.htm', '')}`,
            },
            {
                title: '工学-card',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/:column/:id',
                target: (params) => `/heu/gx/card/${params.column}/${params.id.replace('.htm', '')}`,
            },
        ],
        uae: [
            {
                title: '水声学院',
                docs: 'https://docs.rsshub.app/university.html#ha-er-bin-gong-cheng-da-xue',
                source: '/:id/list.htm',
                target: '/heu/uae/list/:id',
            },
        ],
    },
};
