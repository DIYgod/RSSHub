module.exports = {
    'yoasobi-music.jp': {
        _name: 'Yoasobi Official',
        www: [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/en/live.html#yoasobi',
                source: ['/', '/:category'],
                target: '/yoasobi-music/info/:category',
            },
            {
                title: 'Biography',
                docs: 'https://docs.rsshub.app/en/live.html#yoasobi',
                source: ['/', '/:category'],
                target: '/yoasobi-music/info/:category',
            },
            {
                title: 'Live',
                docs: 'https://docs.rsshub.app/en/live.html#yoasobi',
                source: ['/', '/live'],
                target: '/yoasobi-music/live',
            },
            {
                title: 'Media',
                docs: 'https://docs.rsshub.app/en/live.html#yoasobi',
                source: ['/', '/media'],
                target: '/yoasobi-music/media',
            },
        ],
    },
};
