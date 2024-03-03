export default {
    'yuque.com': {
        _name: '语雀',
        '.': [
            {
                title: '知识库',
                docs: 'https://docs.rsshub.app/routes/study#yu-que',
                source: [':name/:book'],
                target: '/yuque/:name/:book',
            },
        ],
    },
};
