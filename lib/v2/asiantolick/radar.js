module.exports = {
    'asiantolick.com': {
        _name: 'Asian to lick',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/picture.html#asian-to-lick-shou-ye',
                source: ['/'],
                target: '/asiantolick',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/picture.html#asian-to-lick-fen-lei',
                source: ['/'],
                target: (params, url) => `/asiantolick/category/${new URL(url).toString().split('-').pop()}`,
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/picture.html#asian-to-lick-biao-qian',
                source: ['/'],
                target: (params, url) => `/asiantolick/tag/${new URL(url).toString().split('-').pop()}`,
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/picture.html#asian-to-lick-sou-suo',
                source: ['/search/:keyword', '/'],
                target: '/asiantolick/search/:keyword?',
            },
        ],
    },
};
