module.exports = {
    'bloomberg.com': {
        _name: 'bloomberg',
        www: [
            {
                title: 'Bloomberg',
                docs: 'https://docs.rsshub.app/finance.html##bloomberg-news',
                source: ['/:site', '/'],
                target: '/bloomberg/:site?',
            },
        ],
    },
};
