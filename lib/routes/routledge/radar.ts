export default {
    'routledge.com': {
        _name: 'Routledge',
        '.': [
            {
                title: 'Book Series',
                docs: 'https://docs.rsshub.app/routes/journals#routledge',
                source: ['/:bookName/book-series/:bookId'],
                target: '/routledge/:bookName/book-series/:bookId',
            },
        ],
    },
};
