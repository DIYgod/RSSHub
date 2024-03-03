export default {
    'instructables.com': {
        _name: 'Instructables',
        '.': [
            {
                title: 'All Projects - Instructables',
                docs: 'https://docs.rsshub.app/routes/other#instructables',
                source: ['/projects'],
                target: '/instructables/projects',
            },
            {
                title: 'Projects - Instructables',
                docs: 'https://docs.rsshub.app/routes/other#instructables',
                source: ['/:category/projects'],
                target: (params) => `/instructables/projects/${params.category}`,
            },
        ],
    },
};
