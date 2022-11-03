module.exports = {
    'dcard.tw': {
        _name: 'Dcard',
        www: [
            {
                title: '首頁帖子-最新',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f',
                target: '/dcard/posts/latest',
            },
            {
                title: '首頁帖子-熱門',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f',
                target: '/dcard/posts/popular',
            },
            {
                title: '板塊帖子-最新',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f/:section',
                target: '/dcard/:section/latest',
            },
            {
                title: '板塊帖子-熱門',
                docs: 'https://docs.rsshub.app/bbs.html#dcard',
                source: '/f/:section',
                target: '/dcard/:section/popular',
            },
        ],
    },
};
