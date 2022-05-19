module.exports = {
    'jandan.net': {
        _name: '煎蛋',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/picture.html#jian-dan-shou-ye',
                source: ['/:category', '/'],
                target: '/jandan/:category?',
            },
            {
                title: '板块',
                docs: 'https://docs.rsshub.app/picture.html#jian-dan-ban-kuai',
                source: ['/:category', '/'],
                target: '/jandan/:category?',
            },
        ],
    },
};
