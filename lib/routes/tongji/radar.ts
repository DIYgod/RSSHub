export default {
    'tongji.edu.cn': {
        _name: '同济大学',
        bksy: [
            {
                title: '本科生院通知公告',
                docs: 'https://docs.rsshub.app/routes/university#tong-ji-da-xue',
                source: ['/'],
                target: '/tongji/bks',
            },
        ],
        sse: [
            {
                title: '软件学院通知',
                docs: 'https://docs.rsshub.app/routes/university#tong-ji-da-xue',
                source: ['/xxzx/xytz/:type', '/xxzx/:type', '/'],
                target: (params) => `/tongji/sse${params.type ? `/${params.type.replace('.htm', '')}` : ''}`,
            },
        ],
        yz: [
            {
                title: '研究生院通知公告',
                docs: 'https://docs.rsshub.app/routes/university#tong-ji-da-xue',
                source: ['/zsxw/ggtz.htm', '/'],
                target: '/tongji/yjs',
            },
        ],
    },
};
