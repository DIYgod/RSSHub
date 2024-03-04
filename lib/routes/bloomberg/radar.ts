export default {
    'bloomberg.com': {
        _name: 'Bloomberg',
        www: [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/finance#bloomberg-news',
                source: ['/:site', '/'],
                target: '/bloomberg/:site?',
            },
            {
                title: 'Authors',
                docs: 'https://docs.rsshub.app/routes/finance#bloomberg',
                source: ['/*/authors/:id/:slug', '/authors/:id/:slug'],
                target: '/bloomberg/authors/:id/:slug',
            },
        ],
    },
};
