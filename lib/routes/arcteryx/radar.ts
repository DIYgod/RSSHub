export default {
    'arcteryx.com': {
        _name: 'Arcteryx',
        '.': [
            {
                title: '新发布',
                docs: 'https://docs.rsshub.app/routes/shopping#arcteryx',
                source: ['/:country/en/c/:gender/new-arrivals'],
                target: '/arcteryx/new-arrivals/:country/:gender',
            },
        ],
        outlet: [
            {
                title: 'Outlet',
                docs: 'https://docs.rsshub.app/routes/shopping#arcteryx',
                source: ['/:country/en/c/:gender'],
                target: '/arcteryx/outlet/:country/:gender',
            },
        ],
        regear: [
            {
                title: 'Regear 新发布',
                docs: 'https://docs.rsshub.app/routes/shopping#arcteryx',
                source: ['/shop/new-arrivals', '/'],
                target: '/arcteryx/regear/new-arrivals',
            },
        ],
    },
};
