export default {
    'seekingalpha.com': {
        _name: 'Seeking Alpha',
        '.': [
            {
                title: 'Summary',
                docs: 'https://docs.rsshub.app/routes/finance#seeking-alpha',
                source: ['/symbol/:symbol/:category', '/symbol/:symbol/earnings/:category'],
                target: '/seekingalpha/:symbol/:category',
            },
        ],
    },
};
