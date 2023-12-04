module.exports = {
    'thehindu.com': {
        _name: 'The Hindu',
        '.': [
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/routes/en/traditional-media#the-hindu',
                source: ['/topic/:topic'],
                target: '/thehindu/topic/:topic',
            },
        ],
    },
};
