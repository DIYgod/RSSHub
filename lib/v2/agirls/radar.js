module.exports = {
    'aotter.net': {
        _name: '電獺少女',
        agirls: [
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/routes/new-media##dian-ta-shao-nu',
                source: ['/posts/:category'],
                target: '/agirls/:category',
            },
            {
                title: '精選主題列表',
                docs: 'https://docs.rsshub.app/routes/new-media##dian-ta-shao-nu',
                source: ['/', '/topic'],
                target: '/agirls/topic_list',
            },
        ],
    },
};
