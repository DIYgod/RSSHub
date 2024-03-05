export default {
    'pnas.org': {
        _name: 'Proceedings of the National Academy of Sciences',
        '.': [
            {
                title: '期刊',
                docs: 'https://docs.rsshub.app/routes/journal#proceedings-of-the-national-academy-of-sciences',
                source: ['/*topicPath'],
                target: '/pnas/:topicPath',
            },
        ],
    },
};
