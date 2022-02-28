module.exports = {
    'readhub.cn': {
        _name: 'Readhub',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#readhub',
                source: ['/', '/:category'],
                target: (params) => `/readhub/${params.category ? params.category : ''}`,
            },
        ],
    },
};
