export default {
    'apple.com': {
        _name: 'Apple',
        apps: [
            {
                title: '价格更新',
                docs: 'https://docs.rsshub.app/routes/program-update#app-store-mac-app-store',
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
                docs: 'https://docs.rsshub.app/routes/program-update#app-store-mac-app-store',
                source: ['/xianmian'],
                target: '/appstore/xianmian',
            },
        ],
    },
};
