module.exports = {
    'ximalaya.com': {
        _name: '喜马拉雅',
        '.': [
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/routes/multimedia#xi-ma-la-ya',
                source: '/:type/:id',
                target: (params) => {
                    if (parseInt(params.id) + '' === params.id) {
                        return '/ximalaya/:type/:id';
                    }
                },
            },
        ],
    },
};
