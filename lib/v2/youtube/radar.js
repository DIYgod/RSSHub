module.exports = {
    'youtube.com': {
        _name: 'YouTube',
        charts: [
            {
                title: '音乐排行榜',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: ['/charts/:category/:country/*', '/charts/:category/:country', '/charts/:category'],
                target: (params) => `/youtube/charts/${params.category}${params.country ? params.country : ''}`,
            },
        ],
        www: [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/user/:username',
                target: '/youtube/user/:username',
            },
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/channel/:id',
                target: '/youtube/channel/:id',
            },
            {
                title: '自定义网址',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/c/:id',
                target: '/youtube/c/:id',
            },
            {
                title: '播放列表',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: '/playlist',
                target: (params, url) => `/youtube/playlist/${new URL(url).searchParams.get('list')}`,
            },
            {
                title: '订阅列表',
                docs: 'https://docs.rsshub.app/social-media.html#youtube',
                source: ['/feed/subscriptions', '/feed/channels'],
                target: '/youtube/subscriptions',
            },
        ],
    },
};
