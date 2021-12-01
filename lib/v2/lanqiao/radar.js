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
                title: '最新发布的课程',
                docs: 'https://docs.rsshub.app/programming.html#lan-qiao-yun-ke-zuo-zhe-fa-bu-de-ke-cheng',
                source: ['/course/'],
                target: '/lanqiao/course/全部',
            },
        ],
    },
};
