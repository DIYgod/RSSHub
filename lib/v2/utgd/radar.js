module.exports = {
    'utgd.net': {
        _name: 'UNTAG',
        '.': [
            {
                title: '时间线',
                docs: 'https://docs.rsshub.app/new-media.html#untag-shi-jian-xian',
                source: ['/'],
                target: '/utgd/timeline',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#untag-fen-lei',
                source: ['/category/s/:category', '/'],
                target: '/utgd/:category',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/new-media.html#untag-zhuan-ti',
                source: ['/topic', '/'],
                target: '/utgd/topic/:topic',
            },
        ],
    },
};
