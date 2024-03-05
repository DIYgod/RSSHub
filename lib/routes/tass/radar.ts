export default {
    'tass.com': {
        _name: 'Russian News Agency TASS',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/traditional-media.html#russian-news-agency-tass',
                source: ['/:category'],
                target: '/tass/:category',
            },
        ],
    },
};
