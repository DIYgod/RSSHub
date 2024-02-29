module.exports = {
    'apple.com': {
        _name: 'Apple',
        apps: [
            {
                title: 'App Update',
                docs: 'https://docs.rsshub.app/routes/program-update#app-store-mac-app-store-app-update',
                source: ['/:country/app/:appSlug/:id', '/:country/app/:id'],
                target: '/apple/apps/update/:country/:id',
            },
        ],
        support: [
            {
                title: '换和维修扩展计划',
                docs: 'https://docs.rsshub.app/routes/other#apple',
                source: ['/:country/service-programs'],
                target: '/apple/exchange_repair/:country',
            },
        ],
    },
};
