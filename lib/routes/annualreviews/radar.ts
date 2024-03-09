export default {
    'annualreviews.org': {
        _name: 'Annual Reviews',
        '.': [
            {
                title: 'Journal',
                docs: 'https://docs.rsshub.app/routes/journal#annual-reviews-journal',
                source: ['/journal/:id', '/'],
                target: '/annualreviews/:id',
            },
        ],
    },
};
