export default {
    'ustb.edu.cn': {
        _name: '北京科技大学',
        gs: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-ke-ji-da-xue',
                source: '/:type',
                target: '/ustb/yjsy/news/:type',
            },
        ],
        tj: [
            {
                title: '天津学院',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-ke-ji-da-xue',
                source: ['/*'],
                target: '/ustb/tj/news/all',
            },
        ],
        yzxc: [
            {
                title: '研究生招生信息网',
                docs: 'https://docs.rsshub.app/routes/university#bei-jing-ke-ji-da-xue-yan-jiu-sheng-zhao-sheng-xin-xi-wang',
                source: '/',
                target: '/ustb/yzxc/tzgg',
            },
        ],
    },
};
