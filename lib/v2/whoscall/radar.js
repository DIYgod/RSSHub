module.exports = {
    'whoscall.com': {
        _name: 'Whoscall',
        '.': [
            {
                title: '最新文章',
                docs: 'https://docs.rsshub.app/routes/blog#whoscall-zui-xin-wen-zhang',
                source: ['/zh-hant/blog/articles', '/'],
                target: '/whoscall',
            },
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/routes/blog#whoscall-fen-lei',
                source: ['/zh-hant/blog/categories/:category', '/'],
                target: '/whoscall/categories/:category?',
            },
            {
                title: '標籤',
                docs: 'https://docs.rsshub.app/routes/blog#whoscall-biao-qian',
                source: ['/zh-hant/blog/tags/:tag', '/'],
                target: '/whoscall/tags/:tag?',
            },
        ],
    },
};
