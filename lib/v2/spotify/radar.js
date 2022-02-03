module.exports = {
    'spotify.com': {
        _name: 'Spotify',
        open: [
            {
                title: '播放列表',
                // TODO: update docs link
                docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao',
                source: ['/playlist/:id'],
                target: '/spotify/playlist/:id',
            },
            {
                title: '歌手专辑',
                // TODO: update docs link
                docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao',
                source: ['/artist/:id'],
                target: '/spotify/artist/:id',
            },
            {
                title: '用户喜爱歌曲',
                // TODO: update docs link
                docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao',
                source: ['/collection/tracks'],
                target: '/spotify/saved',
            },
            {
                title: '用户 Top Tracks',
                // TODO: update docs link
                docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao',
                source: ['/'],
                target: '/spotify/top/tracks',
            },
            {
                title: '用户 Top Artists',
                // TODO: update docs link
                docs: 'https://docs.rsshub.app/shopping.html#furstar-zui-xin-shou-mai-jiao-se-lie-biao',
                source: ['/'],
                target: '/spotify/top/artists',
            },
        ],
    },
};
