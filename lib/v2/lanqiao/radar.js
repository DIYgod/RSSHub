module.exports = {
    'lanqiao.cn': {
        _name: '蓝桥云课',
        '.': [
            {
                title: '作者发布的课程',
                docs: 'https://docs.rsshub.app/programming.html#lan-qiao-yun-ke-zuo-zhe-fa-bu-de-ke-cheng',
                source: ['/users/:uid'],
                target: '/lanqiao/author/:uid',
            },
            {
                title: '全站发布的课程',
                docs: 'https://docs.rsshub.app/programming.html#lan-qiao-yun-ke-quan-zhan-fa-bu-de-ke-cheng',
                source: ['/courses/'],
                target: '/lanqiao/courses/all',
            },
            {
                title: '技术社区',
                docs: 'https://docs.rsshub.app/programming.html#lan-qiao-yun-ke-ji-shu-she-qu',
                source: ['/questions/', '/questions/topics/:id'],
                target: '/lanqiao/questions/:id',
            },
        ],
    },
};
