module.exports = {
    'followin.io': {
        _name: 'Followin',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/finance.html#followin',
                source: ['/:lang'],
                target: (params) => (params.lang !== 'news' ? '/followin/1/:lang' : ''),
            },
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/finance.html#followin',
                source: ['/:lang?/news', '/news'],
                target: '/followin/news/:lang?',
            },
            {
                title: 'KOL',
                docs: 'https://docs.rsshub.app/finance.html#followin',
                source: ['/:lang/kol/:kolId', '/kol/:kolId'],
                target: '/followin/kol/:kolId/:lang?',
            },
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/finance.html#followin',
                source: ['/:lang/topic/:topicId', '/topic/:topicId'],
                target: '/followin/topic/:topicId/:lang?',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/finance.html#followin',
                source: ['/:lang/tag/:tagId', '/tag/:tagId'],
                target: '/followin/tag/:tagId/:lang?',
            },
        ],
    },
};
