module.exports = {
    'ekantipur.com': {
        _name: 'Ekantipur',
        '.': [
            {
                title: 'Full Article RSS',
                docs: 'https://docs.rsshub.app/routes/traditional-media#ekantipur-rss',
                source: ['/:channel'],
                target: '/ekantipur/:channel',
            },
        ],
    },
};