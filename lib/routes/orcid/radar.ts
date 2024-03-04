export default {
    'orcid.org': {
        _name: 'ORCID',
        '.': [
            {
                title: '作品列表',
                docs: 'https://docs.rsshub.app/routes/study#orcid',
                source: ['/:id', '/'],
                target: '/ocrid/:id',
            },
        ],
    },
};
