module.exports = {
    'douyin.com': {
        _name: '抖音',
        '.': [
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/social-media.html#dou-yin',
                source: '/hashtag/:cid',
                target: '/douyin/hashtag/:cid',
            },
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/social-media.html#dou-yin',
                source: '/user/:uid',
                target: '/douyin/user/:uid',
            },
        ],
        live: [
            {
                title: '直播间开播',
                docs: 'https://docs.rsshub.app/live.html#dou-yin-zhi-bo',
                source: '/:rid',
                target: '/douyin/live/:rid',
            },
        ],
    },
};
