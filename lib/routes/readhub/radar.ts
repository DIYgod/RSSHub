export default {
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
            {
                title: '每日早报',
                docs: 'https://docs.rsshub.app/routes/new-media#readhub-mei-ri-zao-bao',
                source: ['/daily'],
                target: '/readhub/daily',
            },
        ],
    },
};
