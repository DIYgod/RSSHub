module.exports = {
    'qlu.edu.cn': {
        _name: '齐鲁工业大学',
        '.': [
            {
                title: '通知公告',
                docs: 'https://docs.rsshub.app/university.html#qi-lu-gong-ye-da-xue',
                source: ['/tzggsh/list1.htm'],
                target: '/qlu/notice',
            },
        ],
        yjszs: [
            {
                title: '研究生招生信息网',
                docs: 'https://docs.rsshub.app/university.html#qi-lu-gong-ye-da-xue',
                source: ['/:type/list.htm'],
                target: '/qlu/yjszs/:type',
            },
        ],
    },
};
