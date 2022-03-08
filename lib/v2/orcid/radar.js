module.exports = {
    'orcid.org': {
        _name: 'ORCID',
        '.': [
            {
                title: '作品列表',
                docs: 'https://docs.rsshub.app/study.html#orcid',
                source: ['/:id', '/'],
                target: '/ocrid/:id',
            },
        ],
    },
};
