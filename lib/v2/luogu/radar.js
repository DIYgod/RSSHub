module.exports = {
    'luogu.com.cn': {
        _name: '洛谷',
        '.': [
            {
                title: '日报',
                docs: 'https://docs.rsshub.app/programming.html#luo-gu',
                source: ['/discuss/47327', '/'],
                target: '/luogu/daily',
            },
            {
                title: '比赛列表',
                docs: 'https://docs.rsshub.app/programming.html#luo-gu',
                source: ['/contest/list', '/'],
                target: '/luogu/contest',
            },
            {
                title: '用户动态',
                docs: 'https://docs.rsshub.app/programming.html#luo-gu',
                source: ['/user/:uid'],
                target: '/luogu/user/feed/:uid',
            },
            {
                title: '用户博客',
                docs: 'https://docs.rsshub.app/programming.html#luo-gu',
                source: ['/blog/:name'],
                target: '/luogu/user/blog/:name',
            },
        ],
    },
};
