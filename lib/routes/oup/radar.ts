export default {
    'oup.com': {
        _name: 'Oxford University Press',
        academic: [
            {
                title: '期刊',
                docs: 'https://docs.rsshub.app/routes/journal#oxford-university-press',
                source: ['/', '/:name/issue'],
                target: '/oup/journals/:name',
            },
        ],
    },
};
