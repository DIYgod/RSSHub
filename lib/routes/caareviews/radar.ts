export default {
    'caareviews.org': {
        _name: 'caa.reviews',
        '.': [
            {
                title: 'Book Reviews',
                docs: 'https://docs.rsshub.app/routes/journal#caa-reviews',
                source: ['/reviews/book'],
                target: '/caareviews/book',
            },
            {
                title: 'Exhibition Reviews',
                docs: 'https://docs.rsshub.app/routes/journal#caa-reviews',
                source: ['/reviews/exhibition'],
                target: '/caareviews/exhibition',
            },
            {
                title: 'Essays',
                docs: 'https://docs.rsshub.app/routes/journal#caa-reviews',
                source: ['/reviews/essay'],
                target: '/caareviews/essay',
            },
        ],
    },
};
