module.exports = {
    'www.ddosi.org': {
        _name: '🔰雨苁ℒ🔰',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/blog.html#yu-cong-bo-ke-shou-ye',
                source: ['/'],
                target: '/ddosi/',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/blog.html#yu-cong-bo-ke-fen-lei',
                source: ['/category/:category/'],
                target: '/ddosi/category/:category',
            },
        ],
    },
};
