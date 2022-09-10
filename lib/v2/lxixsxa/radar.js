module.exports = {
    'sonymusic.co.jp': {
        _name: 'Sony Music',
        www: [
            {
                title: 'LiSA News',
                docs: 'https://docs.rsshub.app/en/live.html#lisa',
                source: ['/artist/lisa/'],
                target: '/lisa/info',
            },
            {
                title: 'LiSA Albums',
                docs: 'https://docs.rsshub.app/en/live.html#lisa',
                source: ['/artist/lisa/'],
                target: '/lisa/disco',
            },
        ],
    },
    'lxixsxa.com': {
        _name: 'LiSA Official',
        www: [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/en/live.html#lisa',
                source: ['/', '/info'],
                target: '/lisa/info',
            },
            {
                title: 'Albums',
                docs: 'https://docs.rsshub.app/en/live.html#lisa',
                source: ['/', '/discography'],
                target: '/lisa/disco',
            },
        ],
    },
};
