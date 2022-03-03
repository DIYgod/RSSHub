module.exports = {
    'topys.cn': {
        _name: 'TOPYS',
        '.': [
            {
                title: '关键字',
                docs: 'https://docs.rsshub.app/new-media.html#topys-guan-jian-zi',
                source: ['/search/:keyword', '/'],
                target: '/topys/:keyword?',
            },
        ],
    },
};
