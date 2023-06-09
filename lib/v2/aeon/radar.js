module.exports = {
    'aeon.co': {
        _name: 'AEON',
        aeon: [
            {
                title: 'Types (Essays, Videos, or Audio)',
                docs: 'https://docs.rsshub.app/new-media.html##aeon',
                source: ['/:type'],
                target: '/aeon/:type',
            },
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/new-media.html##aeon',
                source: ['/:category'],
                target: '/aeon/category/:category',
            },
        ],
    },
};
