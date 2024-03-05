export default {
    'x-mol.com': {
        _name: 'X-MOL',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/study#x-mol',
                source: ['/news/:area/tag/:tag'],
                target: '/x-mol/news/:tag',
            },
            {
                title: 'News Index',
                docs: 'https://docs.rsshub.app/study#x-mol',
                source: ['/news/index'],
                target: '/x-mol/news',
            },
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/journal#x-mol',
                source: ['/paper/:area/tag/:type/journal/:magazine'],
                target: '/x-mol/paper/geo/:type/:magazine',
            },
        ],
    },
};
