export default {
    'fansly.com': {
        _name: 'Fansly',
        '.': [
            {
                title: 'User Timeline',
                docs: 'https://docs.rsshub.app/routes/social-media.html#fansly',
                source: ['/:username/posts', '/:username/media'],
                target: '/fansly/user/:username',
            },
            {
                title: 'Hashtag',
                docs: 'https://docs.rsshub.app/routes/social-media.html#fansly',
                source: ['/explore/tag/:tag'],
                target: '/fansly/tag/:tag',
            },
        ],
    },
};
