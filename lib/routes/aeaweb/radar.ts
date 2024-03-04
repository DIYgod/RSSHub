export default {
    'aeaweb.org': {
        _name: 'American Economic Association',
        '.': [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#american-economic-association-journal',
                source: ['/journals/:id', '/'],
                target: '/aeaweb/:id',
            },
        ],
    },
};
