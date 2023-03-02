module.exports = {
    'seekingalpha.com': {
        _name: 'Seeking Alpha',
        '.': [
            {
                title: 'Summary',
                docs: 'https://docs.rsshub.app/en/finance.html#seeking-alpha',
                source: ['/symbol/:symbol/:category', '/symbol/:symbol/earnings/:category'],
                target: '/seekingalpha/:symbol/:category',
            },
        ],
    },
};
