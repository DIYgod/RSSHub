export default {
    'qbitai.com': {
        _name: '量子位',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#liang-zi-wei',
                source: ['/category/:category'],
                target: '/qbitai/category/:category',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/new-media#liang-zi-wei',
                source: ['/tag/:tag'],
                target: '/qbitai/tag/:tag',
            },
        ],
    },
};
