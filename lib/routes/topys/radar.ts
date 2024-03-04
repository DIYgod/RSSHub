export default {
    'topys.cn': {
        _name: 'TOPYS',
        '.': [
            {
                title: '关键字',
                docs: 'https://docs.rsshub.app/routes/new-media#topys-guan-jian-zi',
                source: ['/search/:keyword', '/'],
                target: '/topys/:keyword?',
            },
        ],
    },
};
