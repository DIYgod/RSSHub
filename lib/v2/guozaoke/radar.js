module.exports = {
    'guozaoke.com': {
        _name: '过早客',
        '.': [
            {
                title: '子论坛',
                docs: 'https://docs.rsshub.app/bbs.html#guo-zhao-ke',
                source: ['/node/:category', '/'],
                target: (params) => `/guozaoke${params.category ? `/${params.category}` : ''}`,
            },
        ],
    },
};
