export default {
    'youtube.com': {
        _name: 'YouTube',
        charts: [
            {
                title: '音乐排行榜',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: ['/charts/:category/:country/*', '/charts/:category/:country', '/charts/:category'],
                target: (params) => `/youtube/charts/${params.category}${params.country ?? ''}`,
            },
        ],
        www: [
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: '/user/:username',
                target: '/youtube/user/:username',
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: '/:handle',
                target: (params) => (params.handle.startsWith('@') ? `/youtube/user/${params.handle}` : ''),
            },
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: '/channel/:id',
                target: '/youtube/channel/:id',
            },
            {
                title: '自定义网址',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: '/c/:id',
                target: '/youtube/c/:id',
            },
            {
                title: '社群',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: ['/channel/:handle/community', '/channel/:handle', '/:handle/community', '/:handle/featured', '/:handle'],
                target: (params) => (params.handle.startsWith('@') || params.handle.startsWith('UC') ? `/youtube/community/${params.handle}` : ''),
            },
            {
                title: '播放列表',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: '/playlist',
                target: (params, url) => `/youtube/playlist/${new URL(url).searchParams.get('list')}`,
            },
            {
                title: '订阅列表',
                docs: 'https://docs.rsshub.app/routes/social-media#youtube',
                source: ['/feed/subscriptions', '/feed/channels'],
                target: '/youtube/subscriptions',
            },
            {
                title: 'Live',
                docs: 'https://docs.rsshub.app/routes/live#youtube-live',
                source: '/:handle',
                target: (params) => (params.handle.startsWith('@') ? `/youtube/live/${params.handle}` : ''),
            },
        ],
    },
};
