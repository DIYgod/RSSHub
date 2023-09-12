module.exports = {
    'whu.edu.cn': {
        _name: '武汉大学',
        cs: [
            {
                title: '计算机学院公告',
                docs: 'https://docs.rsshub.app/routes/university#wu-han-da-xue',
            },
        ],
        gs: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/routes/university#wu-han-da-xue-yan-jiu-sheng-yuan',
                source: ['/index.htm', '/'],
                target: '/whu/gs',
            },
        ],
        news: [
            {
                title: '新闻网',
                docs: 'https://docs.rsshub.app/routes/university#wu-han-da-xue',
                source: ['/*path'],
                target: (params) => `/whu/news/${params.path.replace('.htm', '')}`,
            },
        ],
    },
};
