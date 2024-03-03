export default {
    'spotify.com': {
        _name: 'Spotify',
        open: [
            {
                title: '歌手专辑',
                docs: 'https://docs.rsshub.app/routes/multimedia#spotify',
                source: ['/artist/:id'],
                target: '/spotify/artist/:id',
            },
            {
                title: '播放列表',
                docs: 'https://docs.rsshub.app/routes/multimedia#spotify',
                source: ['/playlist/:id'],
                target: '/spotify/playlist/:id',
            },
            {
                title: '用户 Saved Tracks',
                docs: 'https://docs.rsshub.app/routes/multimedia#spotify',
                source: ['/collection/tracks'],
                target: '/spotify/saved',
            },
            {
                title: '节目',
                docs: 'https://docs.rsshub.app/routes/multimedia#spotify',
                source: ['/show/:id'],
                target: '/spotify/show/:id',
            },
            {
                title: '用户 Top Artists',
                docs: 'https://docs.rsshub.app/routes/multimedia#spotify',
                source: ['/'],
                target: '/spotify/top/artists',
            },
            {
                title: '用户 Top Tracks',
                docs: 'https://docs.rsshub.app/routes/multimedia#spotify',
                source: ['/'],
                target: '/spotify/top/tracks',
            },
        ],
    },
};
