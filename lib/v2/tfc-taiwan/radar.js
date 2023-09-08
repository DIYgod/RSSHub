module.exports = {
    'tfc-taiwan.org.tw': {
        _name: '台灣事實查核中心',
        '.': [
            {
                title: '專題',
                docs: 'https://docs.rsshub.app/routes/other#tai-wan-shi-shi-cha-he-zhong-xin',
                source: '/articles/category/:id+',
                target: '/tfc-taiwan/category/:id',
            },
            {
                title: '最新相關資訊',
                docs: 'https://docs.rsshub.app/routes/other#tai-wan-shi-shi-cha-he-zhong-xin',
                source: ['/articles/info', '/'],
                target: '/tfc-taiwan/info',
            },
            {
                title: '最新查核報告',
                docs: 'https://docs.rsshub.app/routes/other#tai-wan-shi-shi-cha-he-zhong-xin',
                source: ['/articles/report', '/'],
                target: '/tfc-taiwan/report',
            },
            {
                title: '重點專區',
                docs: 'https://docs.rsshub.app/routes/other#tai-wan-shi-shi-cha-he-zhong-xin',
                source: '/topic/:id',
                target: '/tfc-taiwan/topic/:id',
            },
        ],
    },
};
