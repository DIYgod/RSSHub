module.exports = {
    'instructables.com': {
        _name: 'Instructables',
        '.': [
            {
                title: 'All Projects - Instructables',
                docs: 'https://docs.rsshub.app/other.html#instructables',
                source: ['/projects'],
                target: '/instructables/projects',
            },
            {
                title: 'Projects - Instructables',
                docs: 'https://docs.rsshub.app/other.html#instructables',
                source: ['/:category/projects'],
                target: (params) => `/instructables/projects/${params.category}`,
            },
        ],
    },
};
