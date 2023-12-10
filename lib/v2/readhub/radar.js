module.exports = {
    'readhub.cn': {
        _name: 'Readhub',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#readhub-fen-lei',
                source: ['/', '/:category'],
                target: (params) => {
                    const category = params.category;

                    return `/readhub${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
};
