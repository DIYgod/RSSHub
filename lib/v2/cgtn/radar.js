module.exports = {
    'cgtn.com': {
        _name: '中国环球电视网 CGTN',
        '.': [
            {
                title: '播客',
                docs: 'https://docs.rsshub.app/traditional-media.html#zhong-guo-huan-qiu-dian-shi-wang',
                source: ['/podcast/column/:category/*/:id'],
                target: '/cgtn/podcast/:category/:id',
            },
        ],
    },
};
