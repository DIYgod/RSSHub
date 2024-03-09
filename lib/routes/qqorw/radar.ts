export default {
    'qqorw.cn': {
        _name: '早报网',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#zao-bao-wang-fen-lei',
                source: ['/:category', '/'],
                target: '/qqorw/:category?',
            },
        ],
    },
};
