module.exports = {
    'diandong.com': {
        _name: '电动邦',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#dong-qiu-di',
                source: ['/news'],
                target: '/diandong/news/:cate',
            },
            {
                title: '电动号',
                docs: 'https://docs.rsshub.app/new-media.html#dong-qiu-di',
                source: ['/news/ddh'],
                target: '/diandong/ddh/:cate',
            },
        ],
    },
};
