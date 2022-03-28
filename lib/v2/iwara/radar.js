module.exports = {
    'iwara.tv': {
        _name: 'iwara',
        ecchi: [
            {
                title: '用户视频',
                docs: '',
                source: '/users/:username',
                target: '/iwara/users/:username?/video',
            },
            {
                title: '用户图片',
                docs: '',
                source: '/users/:username',
                target: '/iwara/users/:username?/image',
            },
        ],
    },
};
