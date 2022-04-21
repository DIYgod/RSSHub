module.exports = {
    'feeddd.org': {
        _name: '微信',
        '.': [
            {
                title: '公众号 (feeddd 来源)',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/'],
            },
        ],
    },
    'data258.com': {
        _name: '微信',
        mp: [
            {
                title: '公众号 (微阅读来源)',
                docs: 'https://docs.rsshub.app/new-media.html#wei-xin',
                source: ['/', '/article/category/:id'],
                target: '/wechat/data258/:id?',
            },
        ],
    },
};
