module.exports = {
    'aeaweb.org': {
        _name: 'American Economic Association',
        '.': [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/journal.html#american-economic-association-journal',
                source: ['/journals/:id', '/'],
                target: '/aeaweb/:id',
            },
        ],
    },
};
