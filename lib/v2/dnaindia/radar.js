module.exports = {
    'dnaindia.com': {
        _name: 'DNA India',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/en/traditional.html#dna-india',
                source: ['/:category'],
                target: '/:category',
            },
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/en/traditional.html#dna-india',
                source: ['/topic/:topic'],
                target: '/topic/:topic',
            },
        ],
    },
};
