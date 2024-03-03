export default {
    'youku.com': {
        _name: '优酷',
        i: [
            {
                title: '订阅作者',
                docs: 'https://docs.rsshub.app/routes/multimedia#you-ku',
                source: ['/i/:id'],
                target: '/youku/channel/:id',
            },
        ],
    },
};
