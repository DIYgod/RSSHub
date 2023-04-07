module.exports = {
    'freecomputerbooks.com': {
        _name: 'Free Computer Books',
        '.': [
            {
                title: 'Selected New Books',
                docs: 'https://docs.rsshub.app/en/reading.html#free-computer-books',
                source: ['/', '/index.html'],
                target: '/freecomputerbooks',
            },
            {
                title: 'Current Book List',
                docs: 'https://docs.rsshub.app/en/reading.html#free-computer-books',
                source: ['/:category'],
                target: (params, _, document) => {
                    const categoryId = params.category.replace('.html', '');

                    if (categoryId === 'index') {
                        return; // only matching the "Selected New Books" rule above
                    }

                    if (!document.querySelector('ul[id^=newBooks]')) {
                        return; // not a proper book list page
                    }

                    return '/freecomputerbooks/' + categoryId;
                },
            },
        ],
    },
};
