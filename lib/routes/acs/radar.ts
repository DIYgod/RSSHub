export default {
    'acs.org': {
        _name: 'American Chemistry Society',
        pubs: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#american-chemistry-society',
                source: ['/journal/:id', '/'],
                target: '/acs/journal/:id',
            },
        ],
    },
};
