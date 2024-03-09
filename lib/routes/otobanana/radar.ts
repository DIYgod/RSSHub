export default {
    'otobanana.com': {
        _name: 'OTOBANANA',
        '.': [
            {
                title: 'Timeline タイムライン',
                docs: 'https://docs.rsshub.app/multimedia#otobanana',
                source: ['/user/:id'],
                target: '/otobanana/user/:id',
            },
            {
                title: 'Cast 音声投稿',
                docs: 'https://docs.rsshub.app/multimedia#otobanana',
                source: ['/user/:id/cast', '/user/:id'],
                target: '/otobanana/user/:id/cast',
            },
            {
                title: 'Livestream ライブ配信',
                docs: 'https://docs.rsshub.app/multimedia#otobanana',
                source: ['/user/:id/livestream', '/user/:id'],
                target: '/otobanana/user/:id/livestream',
            },
        ],
    },
};
