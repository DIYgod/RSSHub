export default {
    'dnaindia.com': {
        _name: 'DNA India',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dna-india',
                source: ['/:category'],
                target: '/dnaindia/:category',
            },
            {
                title: 'Topic',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dna-india',
                source: ['/topic/:topic'],
                target: '/dnaindia/topic/:topic',
            },
        ],
    },
};
