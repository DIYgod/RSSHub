module.exports = {
    'acs.org': {
        _name: 'American Chemistry Society',
        pubs: [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/journal.html#american-chemistry-society',
                source: ['/journal/:id', '/'],
                target: '/acs/journal/:id',
            },
        ],
    },
};
