module.exports = {
    'instructables.com': {
        _name: 'Instructables',
        '.': [
            {
                title: 'All Projects - Instructables',
                docs: 'https://docs.rsshub.app/other.html#instructables',
                source: ['/projects'],
                target: '/instructalbes',
            },
            {
                title: 'Projects - Instructables',
                docs: 'https://docs.rsshub.app/other.html#instructables',
                source: ['/:category/projects'],
                target: (params) => `/instructalbes/${params.category}`,
            },
        ],
    },
};
