export default {
    'iq.com': {
        _name: '爱奇艺',
        '.': [
            {
                title: '剧集',
                docs: 'https://docs.rsshub.app/routes/multimedia#ai-qi-yi',
                source: ['/album/:id'],
                target: '/iqiyi/:category/:id',
            },
        ],
    },
    'iqiyi.com': {
        _name: '爱奇艺',
        '.': [
            {
                title: '用户视频',
                docs: 'https://docs.rsshub.app/routes/multimedia#ai-qi-yi',
                source: ['/u/:uid/*'],
                target: '/iqiyi/user/video/:uid',
            },
        ],
    },
};
