module.exports = {
    'spotify.com': {
        _name: 'Spotify',
        open: [
            {
                title: '播放列表',
                docs: 'https://docs.rsshub.app/multimedia.html#spotify',
                source: ['/playlist/:id'],
                target: '/spotify/playlist/:id',
            },
            {
                title: '歌手专辑',
                docs: 'https://docs.rsshub.app/multimedia.html#spotify',
                source: ['/artist/:id'],
                target: '/spotify/artist/:id',
            },
            {
                title: '用户 Saved Tracks',
                docs: 'https://docs.rsshub.app/multimedia.html#spotify',
                source: ['/collection/tracks'],
                target: '/spotify/saved',
            },
            {
                title: '用户 Top Tracks',
                docs: 'https://docs.rsshub.app/multimedia.html#spotify',
                source: ['/'],
                target: '/spotify/top/tracks',
            },
            {
                title: '用户 Top Artists',
                docs: 'https://docs.rsshub.app/multimedia.html#spotify',
                source: ['/'],
                target: '/spotify/top/artists',
            },
        ],
    },
};
