export default {
    'abmedia.io': {
        _name: 'abmedia.io',
        www: [
            {
                title: '首页最新新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#lian-xin-wen-abmedia-shou-ye-zui-xin-xin-wen',
                source: ['/'],
                target: '/abmedia/index',
            },
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/new-media#lian-xin-wen-abmedia-lei-bie',
                source: ['/category/:catehory'],
                target: '/abmedia/:category',
            },
        ],
    },
};
