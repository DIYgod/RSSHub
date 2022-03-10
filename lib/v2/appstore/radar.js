module.exports = {
    'apple.com': {
        _name: 'Apple',
        apps: [
            {
                title: '应用更新',
                docs: 'https://docs.rsshub.app/program-update.html#app-store-mac-app-store',
                source: ['/:contry/app/:id'],
                target: '/appstore/update/:country/:id',
            },
            {
                title: '价格更新',
                docs: 'https://docs.rsshub.app/program-update.html#app-store-mac-app-store',
                source: ['/'],
                target: '/appstore/price/:country/:type/:id',
            },
        ],
    },
    'app.so': {
        _name: '鲜面连线',
        '.': [
            {
                title: '限免应用',
                docs: 'https://docs.rsshub.app/program-update.html#app-store-mac-app-store',
                source: ['/xianmian'],
                target: '/appstore/xianmian',
            },
        ],
    },
    'gofans.cn': {
        _name: 'GoFans',
        '.': [
            {
                title: '最新限免',
                docs: 'https://docs.rsshub.app/program-update.html#app-store-mac-app-store',
                source: ['/'],
                target: '/appstore/gofans',
            },
        ],
    },
};
