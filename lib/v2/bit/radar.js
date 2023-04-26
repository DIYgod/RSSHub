module.exports = {
    'bit.edu.cn': {
        _name: '北京理工大学',
        rszhaopin: [
            {
                title: '人才招聘',
                docs: 'https://docs.rsshub.app/university.html#bei-jing-li-gong-da-xue-ren-cai-zhao-pin',
                source: ['/'],
                target: '/bit/:category?',
            },
        ],
        grd: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/university.html#bei-jing-li-gong-da-xue-ren-cai-zhao-pin',
                source: ['/:type/index.htm'],
                target: '/bit/grd/:type',
            },
        ],
    },
};
