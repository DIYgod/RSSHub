export default {
    'storyfm.cn': {
        _name: '故事FM',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/multimedia#ge-shi-fm',
                source: ['/'],
                target: '/storyfm/index',
            },
            {
                title: '播客',
                docs: 'https://docs.rsshub.app/routes/multimedia#ge-shi-fm',
                source: ['/episodes-list', '/'],
                target: '/storyfm/episodes',
            },
        ],
    },
};
