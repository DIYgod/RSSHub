module.exports = {
    'qingting.fm': {
        _name: '蜻蜓 FM',
        '.': [
            {
                title: '专辑',
                docs: 'https://docs.rsshub.app/multimedia.html#qing-ting-fm',
                source: '/channels/:id',
                target: '/qingting/channels/:id',
            },
            {
                title: '播客',
                docs: 'https://docs.rsshub.app/multimedia.html#qing-ting-fm',
                source: '/channels/:id',
                target: '/qingting/podcast/:id',
            },
        ],
    },
};
