export default {
    'douyin.com': {
        _name: '抖音',
        '.': [
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-yin',
                source: '/hashtag/:cid',
                target: '/douyin/hashtag/:cid',
            },
            {
                title: '博主',
                docs: 'https://docs.rsshub.app/routes/social-media#dou-yin',
                source: '/user/:uid',
                target: '/douyin/user/:uid',
            },
        ],
        live: [
            {
                title: '直播间开播',
                docs: 'https://docs.rsshub.app/routes/live#dou-yin-zhi-bo',
                source: '/:rid',
                target: '/douyin/live/:rid',
            },
        ],
    },
};
