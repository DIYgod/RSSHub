module.exports = {
    'sciencedirect.com': {
        _name: 'ScienceDirect',
        '.': [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/journal.html#sciencedirect-journal',
                source: ['/journal/:id', '/'],
                target: '/sciencedirect/journal/:id',
            },
        ],
    },
};
