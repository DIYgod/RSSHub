export default {
    'oschina.net': {
        _name: '开源中国',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/programming#kai-yuan-zhong-guo',
                source: ['/news/:category'],
                target: '/oschina/news/:category',
            },
            {
                title: '问答主题',
                docs: 'https://docs.rsshub.app/routes/programming#kai-yuan-zhong-guo',
                source: ['/question/topic/:topic'],
                target: '/oschina/topic/:topic',
            },
        ],
        my: [
            {
                title: '用户博客',
                docs: 'https://docs.rsshub.app/routes/programming#kai-yuan-zhong-guo',
                source: ['/:id'],
                target: '/oschina/user/:id',
            },
            {
                title: '数字型账号用户博客',
                docs: 'https://docs.rsshub.app/routes/programming#kai-yuan-zhong-guo',
                source: ['/u/:uid'],
                target: '/oschina/u/:uid',
            },
        ],
    },
};
