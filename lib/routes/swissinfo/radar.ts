export default {
    'swissinfo.ch': {
        _name: 'swissinfo',
        '.': [
            {
                title: 'Category',
                docs: 'https://docs.rsshub.app/routes/new-media#swissinfo-category',
                source: ['/:language/:category', '/'],
                target: '/swissinfo/:language?/:category?',
            },
        ],
    },
};
