export default {
    'cgtn.com': {
        _name: '中国环球电视网 CGTN',
        '.': [
            {
                title: '播客',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zhong-guo-huan-qiu-dian-shi-wang',
                source: ['/podcast/column/:category/*/:id'],
                target: '/cgtn/podcast/:category/:id',
            },
        ],
    },
};
