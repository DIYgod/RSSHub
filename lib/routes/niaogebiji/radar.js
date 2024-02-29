module.exports = {
    'niaogebiji.com': {
        _name: '鸟哥笔记',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/new-media#niao-ge-bi-ji',
                source: ['/'],
                target: '/niaogebiji',
            },
            {
                title: '今日事',
                docs: 'https://docs.rsshub.app/routes/new-media#niao-ge-bi-ji',
                source: ['/', '/bulletin'],
                target: '/niaogebiji',
            },
            {
                title: '分类目录',
                docs: 'https://docs.rsshub.app/routes/new-media#niao-ge-bi-ji',
                source: ['/cat/:cat'],
                target: '/niaogebiji/cat/:cat',
            },
        ],
    },
};
