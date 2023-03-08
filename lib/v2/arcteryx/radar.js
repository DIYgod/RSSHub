module.exports = {
    'arcteryx.com': {
        _name: 'Arcteryx',
        '.': [
            {
                title: '新发布',
                docs: 'https://docs.rsshub.app/shopping.html#arcteryx',
                source: ['/:country/en/c/:gender/new-arrivals'],
                target: '/arcteryx/new-arrivals/:country/:gender',
            },
        ],
    },
    'arcteryx.com': {
        _name: 'Arcteryx',
        regear: [
            {
                title: 'Regear 新发布',
                docs: 'https://docs.rsshub.app/shopping.html#arcteryx',
                source: ['/'],
                target: '/arcteryx/regear/new-arrivals',
            },
        ],
    },
};
