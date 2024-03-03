export default {
    'hrbeu.edu.cn': {
        _name: '哈尔滨工程大学',
        yjsy: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-cheng-da-xue',
                source: '/:id/list.htm',
                target: '/hrbeu/yjsy/list/:id',
            },
        ],
        job: [
            {
                title: '大型招聘会',
                docs: 'https://docs.rsshub.app/routes/journal#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/hrbeu/job/bigemploy',
            },
            {
                title: '今日招聘会',
                docs: 'https://docs.rsshub.app/routes/journal#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/hrbeu/job/calendar',
            },
            {
                title: '就业服务平台-通知公告',
                docs: 'https://docs.rsshub.app/routes/journal#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/hrbeu/job/list/tzgg',
            },
            {
                title: '就业服务平台-热点新闻',
                docs: 'https://docs.rsshub.app/routes/journal#ha-er-bin-gong-cheng-da-xue',
                source: '/*',
                target: '/hrbeu/job/list/rdxw',
            },
        ],
        news: [
            {
                title: '工学',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-cheng-da-xue',
                source: '/:column',
                target: (params) => `/hrbeu/gx/list/${params.column.replace('.htm', '')}`,
            },
            {
                title: '工学',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-cheng-da-xue',
                source: '/:column/:id',
                target: (params) => `/hrbeu/gx/list/${params.column}/${params.id.replace('.htm', '')}`,
            },
            {
                title: '工学-card',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-cheng-da-xue',
                source: '/:column',
                target: (params) => `/hrbeu/gx/card/${params.column.replace('.htm', '')}`,
            },
            {
                title: '工学-card',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-cheng-da-xue',
                source: '/:column/:id',
                target: (params) => `/hrbeu/gx/card/${params.column}/${params.id.replace('.htm', '')}`,
            },
        ],
        uae: [
            {
                title: '水声工程学院',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-cheng-da-xue',
                source: '/:id.htm',
                target: '/hrbeu/uae/:id',
            },
        ],
        ugs: [
            {
                title: '本科生院工作通知',
                docs: 'https://docs.rsshub.app/routes/university#ha-er-bin-gong-cheng-da-xue',
                source: '/:author/list.htm',
                target: '/hrbeu/ugs/news/:author',
            },
        ],
    },
};
