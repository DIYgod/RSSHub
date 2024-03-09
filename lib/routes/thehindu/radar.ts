export default {
    'thehindu.com': {
        _name: 'The Hindu',
        '.': [
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/routes/traditional-media#the-hindu',
                source: ['/topic/:topic'],
                target: '/thehindu/topic/:topic',
            },
        ],
    },
};
