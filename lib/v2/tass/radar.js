module.exports = {
    'tass.ru': {
        _name: 'TASS',
        '.': [
            {
                title: 'section',
                docs: 'https://docs.rsshub.app/traditional-media.html#tass',
                source: ['/:section'],
                target: '/ru/:section',
            },
        ],
    },
    'tass.com': {
        _name: 'TASS',
        '.': [
            {
                title: 'section',
                docs: 'https://docs.rsshub.app/traditional-media.html#tass',
                source: ['/:section'],
                target: '/en/:section',
            },
        ],
    },
};
