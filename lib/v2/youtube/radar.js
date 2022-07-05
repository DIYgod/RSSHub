module.exports = {
    'youtube.com': {
        _name: 'YouTube',
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
