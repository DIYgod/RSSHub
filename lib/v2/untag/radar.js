module.exports = {
    'utgd.net': {
        _name: 'UNTAG',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#untag-fen-lei',
                source: ['/category/s/:category', '/'],
                target: '/untag/:category',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/new-media.html#untag-zhuan-ti',
                source: ['/topic', '/'],
                target: '/untag/topic/:topic',
            },
        ],
    },
};
