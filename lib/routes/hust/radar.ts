export default {
    'hust.edu.cn': {
        _name: '华中科技大学',
        aia: [
            {
                title: '人工智能和自动化学院新闻',
                docs: 'https://docs.rsshub.app/routes/university#hua-zhong-ke-ji-da-xue',
                source: ['/xyxw.htm', '/'],
                target: '/hust/aia/news',
            },
            {
                title: '人工智能和自动化学院通知',
                docs: 'https://docs.rsshub.app/routes/university#hua-zhong-ke-ji-da-xue',
                source: ['/tzgg/:type', '/tzgg.htm', '/'],
                target: (params) => `/hust/aia/notice${params.type ? `/${params.type}` : ''}`,
            },
        ],
        gszs: [
            {
                title: '研究生院通知公告',
                docs: 'https://docs.rsshub.app/routes/university#hua-zhong-ke-ji-da-xue',
                source: ['/zsxx/ggtz.htm', '/'],
                target: '/hust/yjs',
            },
        ],
    },
};
