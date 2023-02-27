module.exports = {
    aijishu: {
        _name: '极术社区',
        www: [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/programming.html#aijishu',
                source: ['/channel/:name'],
                target: '/aijishu/channel/:name',
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/programming.html#aijishu',
                source: ['/u/:name'],
                target: '/aijishu/user/:name',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/programming.html#aijishu',
                source: ['/blog/:name'],
                target: '/aijishu/blog/:name',
            },
        ],
    },
};
