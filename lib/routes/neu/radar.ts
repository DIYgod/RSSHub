export default {
    'neu.edu.cn': {
        _name: '东北大学',
        neunews: [
            {
                title: '新闻网',
                docs: 'https://docs.rsshub.app/routes/university#dong-bei-da-xue',
                source: ['/:type/list.htm'],
                target: '/neu/news/:type',
            },
        ],
        'www.bmie': [
            {
                title: '学院新闻 - 医学与生物信息工程学院',
                docs: 'https://docs.rsshub.app/routes/university#dong-bei-da-xue',
                source: ['/'],
                target: '/neu/bmie/news',
            },
        ],
    },
};
