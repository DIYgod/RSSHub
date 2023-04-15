module.exports = {
    'bnu.edu.cn': {
        _name: '北京师范大学',
        bs: [
            {
                title: '经济与工商管理学院',
                docs: 'https://docs.rsshub.app/university.html#bei-jing-shi-fan-da-xue',
                source: ['/:category/index.html'],
                target: '/bnu/bs/:category',
            },
        ],
        dwxgb: [
            {
                title: '党委学生工作部',
                docs: 'https://docs.rsshub.app/university.html#bei-jing-shi-fan-da-xue',
                source: ['/:category/:type/index.html'],
                target: '/bnu/dwxgb/:category/:type',
            },
        ],
        fdy: [
            {
                title: '党委学生工作部辅导员发展中心',
                docs: 'https://docs.rsshub.app/university.html#bei-jing-shi-fan-da-xue',
                source: ['/'],
                target: (_, url) => `/bnu/fdy${new URL(url).pathname.replace(/\/index\.htm(l)?$/, '')}`,
            },
        ],
        'www.lib': [
            {
                title: '图书馆通知',
                docs: 'https://docs.rsshub.app/university.html#bei-jing-shi-fan-da-xue',
                source: ['/:category/index.htm'],
                target: '/bnu/lib/:category',
            },
        ],
    },
};
