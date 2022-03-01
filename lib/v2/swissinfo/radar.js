module.exports = {
    'swissinfo.ch': {
        _name: 'swissinfo',
        '.': [
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/new-media.html#swissinfo-category',
                source: ['/:language/:category', '/'],
                target: '/swissinfo/:language?/:category?',
            },
        ],
    },
};
