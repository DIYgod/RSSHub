export default {
    'seu.edu.cn': {
        _name: '东南大学',
        cse: [
            {
                title: '计算机技术与工程学院',
                docs: 'https://docs.rsshub.app/routes/university#dong-nan-da-xue',
                source: ['/:type/list.htm', '/'],
                target: '/seu/cse/:type?',
            },
        ],
        radio: [
            {
                title: '信息科学与工程学院学术活动',
                docs: 'https://docs.rsshub.app/routes/university#dong-nan-da-xue',
                source: ['/_s29/15986/list.psp', '/'],
                target: '/seu/radio/academic',
            },
        ],
        seugs: [
            {
                title: '研究生院全部公告',
                docs: 'https://docs.rsshub.app/routes/university#dong-nan-da-xue-yan-jiu-sheng-yuan-quan-bu-gong-gao',
                source: ['/26671/list.htm', '/'],
                target: '/seu/yjs',
            },
        ],
        yzb: [
            {
                title: '研究生招生网通知公告',
                docs: 'https://docs.rsshub.app/routes/university#dong-nan-da-xue',
                source: ['/:type/list.htm'],
                target: '/seu/yzb/:type',
            },
        ],
    },
};
