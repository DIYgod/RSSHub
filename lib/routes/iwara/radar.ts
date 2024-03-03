export default {
    'iwara.tv': {
        _name: 'iwara',
        ecchi: [
            {
                title: '用户视频',
                docs: 'https://docs.rsshub.app/routes/anime#iwara',
                source: '/users/:username',
                target: '/iwara/users/:username?/video',
            },
            {
                title: '用户图片',
                docs: 'https://docs.rsshub.app/routes/anime#iwara',
                source: '/users/:username',
                target: '/iwara/users/:username?/image',
            },
            {
                title: '用户订阅列表',
                docs: 'https://docs.rsshub.app/routes/anime#iwara',
                source: '/',
                target: '/iwara/subscriptions',
            },
        ],
    },
};
