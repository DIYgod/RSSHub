export default {
    'domp4.cc': {
        _name: 'domp4电影',
        '.': [
            {
                title: '最近更新',
                docs: 'https://docs.rsshub.app/routes/multimedia#domp4-ying-shi',
                source: ['/', '/custom/update.html'],
                target: '/domp4/latest/:type?',
            },
            {
                title: '剧集订阅',
                docs: 'https://docs.rsshub.app/routes/multimedia#domp4-ying-shi',
                source: '/html/:id',
                target: '/domp4/detail/:id',
            },
            {
                title: '剧集订阅',
                docs: 'https://docs.rsshub.app/routes/multimedia#domp4-ying-shi',
                source: '/detail/:id',
                target: '/domp4/detail/:id',
            },
        ],
    },
};
