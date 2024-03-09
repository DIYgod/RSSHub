export default {
    'sciencedirect.com': {
        _name: 'ScienceDirect',
        '.': [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#sciencedirect-journal',
                source: ['/journal/:id', '/'],
                target: '/sciencedirect/journal/:id',
            },
        ],
    },
};
