module.exports = {
    'qbitai.com': {
        _name: '量子位',
        '.': [
            {
                title: '分类-量子位',
                docs: 'https://docs.rsshub.app/routes/programming#liang-zi-wei',
                source: ['/category/:category'],
                target: '/qbitai/category/:category',
            },
            {
                title: '标签-量子位',
                docs: 'https://docs.rsshub.app/routes/programming#liang-zi-wei',
                source: ['/tag/:tag'],
                target: '/qbitai/tag/:tag',
            },
        ],
    },
};
