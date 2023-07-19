module.exports = {
    'shu.edu.cn': {
        _name: '上海大学',
        jwb: [
            {
                title: '教务处通知公告',
                docs: 'https://docs.rsshub.app/university.html#shang-hai-da-xue',
                source: ['/index/:type'],
                target: '/shu/jwb/:type',
            },
        ],
        www: [
            {
                title: '官网信息',
                docs: 'https://docs.rsshub.app/university.html#shang-hai-da-xue',
                source: ['/:type'],
                target: '/shu/:type',
            },
        ],
    },
};
