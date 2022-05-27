module.exports = {
    'sobooks.net': {
        _name: 'SoBooks',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/reading.html#sobooks',
                source: ['/:category'],
                target: '/sobooks/:category',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/reading.html#sobooks',
                source: ['/books/tag/:tag'],
                target: '/sobooks/tag/:tag',
            },
        ],
    },
};
