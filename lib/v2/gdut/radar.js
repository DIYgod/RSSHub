module.exports = {
    'gdut.edu.cn': {
        _name: '广东工业大学',
        oas: [
            {
                title: '通知公文网',
                docs: 'https://docs.rsshub.app/university.html#guang-dong-gong-ye-da-xue-tong-zhi-gong-wen-wang',
                source: '/seeyon',
                target: '/gdut/oa_news/',
            },
        ],
        yzw: [
            {
                title: '研究生招生信息网',
                docs: 'https://docs.rsshub.app/university.html#guang-dong-gong-ye-da-xue-yan-jiu-sheng-zhao-sheng-xin-xi-wang',
                source: '/yzw/:type',
                target: '/gdut/yzw/:type',
            },
        ],
    },
};
