export default {
    'ouc.edu.cn': {
        _name: '中国海洋大学',
        it: [
            {
                title: '信息科学与工程学院',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-hai-yang-da-xue',
                source: ['/'],
                target: '/ouc/it',
            },
            {
                title: '信息科学与工程学院研究生招生通知公告',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-hai-yang-da-xue',
                source: ['/_s381/16619/list.psp', '/16619/list.htm', '/'],
                target: '/ouc/it/postgraduate',
            },
            {
                title: '信息科学与工程学部团学工作',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-hai-yang-da-xue-xin-xi-ke-xue-yu-gong-cheng-xue-yuan-tuan-xue-gong-zuo',
                source: ['/tx/:id/list.htm'],
                target: '/ouc/it/tx/:id',
            },
        ],
        jwc: [
            {
                title: '教务处',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-hai-yang-da-xue',
                source: ['/', '/6517/list.htm'],
                target: '/ouc/jwc',
            },
        ],
        jwgl: [
            {
                title: '选课信息教务通知',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-hai-yang-da-xue',
                source: ['/cas/login.action', '/public/SchoolNotice.jsp'],
                target: '/ouc/jwgl',
            },
        ],
        yz: [
            {
                title: '研究生院',
                docs: 'https://docs.rsshub.app/routes/university#zhong-guo-hai-yang-da-xue',
                source: ['/5926/list.htm'],
                target: '/ouc/yjs',
            },
        ],
    },
};
