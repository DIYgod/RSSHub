module.exports = {
    'yahoo.com': {
        _name: 'Yahoo',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/traditional-media.html#yahoo',
                source: ['/'],
                target: '/yahoo/news/:region/:category?',
            },
        ],
    },
};
