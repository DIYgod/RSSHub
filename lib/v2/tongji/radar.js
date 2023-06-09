module.exports = {
    'tongji.edu.cn': {
        _name: '同济大学',
        sse: [
            {
                title: '软件学院通知',
                docs: 'https://docs.rsshub.app/university.html#tong-ji-da-xue',
                source: ['/xxzx/xytz/:type', '/xxzx/:type', '/'],
                target: (params) => `/tongji/sse${params.type ? `/${params.type.replace('.htm', '')}` : ''}`,
            },
        ],
        yz: [
            {
                title: '研究生院通知公告',
                docs: 'https://docs.rsshub.app/university.html#tong-ji-da-xue',
                source: ['/zsxw/ggtz.htm', '/'],
                target: '/tongji/yjs',
            },
        ],
    },
};
