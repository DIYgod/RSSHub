module.exports = {
    'bloomberg.com': {
        _name: 'bloomberg',
        www: [
            {
                title: 'Bloomberg',
                docs: 'https://docs.rsshub.app/finance.html#Bloomberg-Frontpage',
                source: ['/:category', '/'],
                target: '/bloomberg/:category?',
            },
        ],
    },
};
