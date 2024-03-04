export default {
    'bjfu.edu.cn': {
        _name: '北京林业大学',
        graduate: [
            {
                title: '研究生院培养动态',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-lin-ye-da-xue',
                source: '/',
                target: '/bjfu/grs',
            },
        ],
        it: [
            {
                title: '信息学院通知',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-lin-ye-da-xue',
                source: '/:type/index.html',
                target: '/bjfu/it/:type',
            },
        ],
        jwc: [
            {
                title: '教务处通知公告',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-lin-ye-da-xue',
                source: '/:type/index.html',
                target: '/bjfu/jwc/:type',
            },
        ],
        kyc: [
            {
                title: '科技处通知公告',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-lin-ye-da-xue',
                source: '/',
                target: '/bjfu/kjc',
            },
        ],
        news: [
            {
                title: '绿色新闻网',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-lin-ye-da-xue',
                source: '/:type/index.html',
                target: '/bjfu/news/:type',
            },
        ],
    },
};
