module.exports = {
    'ibc.co.jp': {
        _name: 'IBC 岩手放送',
        '.': [
            {
                title: 'イヤーマイッタマイッタ',
                docs: 'https://docs.rsshub.app/multimedia.html#ibc-yan-shou-fang-song',
                source: ['/radio/maitta/audio', '/'],
                target: '/ibc/maitta',
            },
            {
                title: 'ラジオ',
                docs: 'https://docs.rsshub.app/multimedia.html#ibc-yan-shou-fang-song',
                source: ['/radio/:id/audio', '/'],
                target: '/ibc/radio/:id?',
            },
        ],
    },
};
