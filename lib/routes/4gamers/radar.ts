export default {
    '4gamers.com.tw': {
        _name: '4Gamers',
        www: [
            {
                title: '最新消息',
                docs: 'https://docs.rsshub.app/routes/game#4gamers',
                source: ['/news', '/'],
                target: '/4gamers',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/game#4gamers',
                source: ['/news/category/:category/:categoryName'],
                target: '/4gamers/category/:category',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/game#4gamers',
                source: ['/news/tag/:tag'],
                target: '/4gamers/tag/:tag',
            },
            {
                title: '主題',
                docs: 'https://docs.rsshub.app/routes/game#4gamers',
                source: ['/news/option-cfg/:topic'],
                target: '/4gamers/topic/:topic',
            },
        ],
    },
};
