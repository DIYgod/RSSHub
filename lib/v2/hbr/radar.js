module.exports = {
    'hbr.org': {
        _name: 'Harvard Business Review',
        '.': [
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/new-media.html#harvard-business-review-topic',
                source: ['/topic/:topic?', '/'],
                target: '/hbr/topic/:topic?/:type?',
            },
        ],
    },
};
