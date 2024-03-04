export default {
    'jianshu.com': {
        _name: '简书',
        www: [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/social-media#jian-shu',
                source: '/',
                target: '/jianshu/home',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/routes/social-media#jian-shu',
                source: '/c/:id',
                target: '/jianshu/collection/:id',
            },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/routes/social-media#jian-shu',
                source: '/u/:id',
                target: '/jianshu/user/:id',
            },
        ],
    },
};
