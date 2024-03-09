export default {
    'hbr.org': {
        _name: 'Harvard Business Review',
        '.': [
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/routes/new-media#harvard-business-review-topic',
                source: ['/topic/:topic?', '/'],
                target: '/hbr/topic/:topic?/:type?',
            },
        ],
    },
};
