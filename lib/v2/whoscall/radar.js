module.exports = {
    'whoscall.com': {
        _name: 'Whoscall',
        '.': [
            {
                title: '最新文章',
                docs: 'https://docs.rsshub.app/blog.html#whoscall-zui-xin-wen-zhang',
                source: ['/zh-hant/blog/articles', '/'],
                target: '/whoscall',
            },
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/blog.html#whoscall-fen-lei',
                source: ['/zh-hant/blog/categories/:category', '/'],
                target: '/whoscall/categories/:category?',
            },
            {
                title: '標籤',
                docs: 'https://docs.rsshub.app/blog.html#whoscall-biao-qian',
                source: ['/zh-hant/blog/tags/:tag', '/'],
                target: '/whoscall/tags/:tag?',
            },
        ],
    },
};
