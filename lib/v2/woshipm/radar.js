module.exports = {
    'woshipm.com': {
        _name: '人人都是产品经理',
        '.': [
            {
                title: '热门文章',
                docs: 'https://docs.rsshub.app/new-media.html#ren-ren-dui-shi-chan-pin-jing-li',
                source: ['/'],
                target: '/woshipm/popular',
            },
            {
                title: '用户收藏',
                docs: 'https://docs.rsshub.app/new-media.html#ren-ren-dui-shi-chan-pin-jing-li',
                source: ['/u/:id'],
                target: '/woshipm/bookmarks/:id',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/new-media.html#ren-ren-dui-shi-chan-pin-jing-li',
                source: ['/u/:id'],
                target: '/woshipm/user_article/:id',
            },
            {
                title: '最新文章',
                docs: 'https://docs.rsshub.app/new-media.html#ren-ren-dui-shi-chan-pin-jing-li',
                source: ['/'],
                target: '/woshipm/latest',
            },
        ],
        wen: [
            {
                title: '天天问',
                docs: 'https://docs.rsshub.app/new-media.html#ren-ren-dui-shi-chan-pin-jing-li',
                source: ['/'],
                target: '/woshipm/wen',
            },
        ],
    },
};
