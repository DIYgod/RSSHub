module.exports = {
    'bilibili.com': {
        _name: 'bilibili',
        www: [
            {
                title: '分区视频',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: ['/v/*tpath', '/documentary', '/movie', '/tv'],
            },
            {
                title: '视频评论',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/video/:aid',
                target: (params) => `/bilibili/video/reply/${params.aid.replace('av', '')}`,
            },
            {
                title: '视频弹幕',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/video/:aid',
                target: (params, url) => {
                    const pid = new URL(url).searchParams.get('p');
                    return `/bilibili/video/danmaku/${params.aid.replace('av', '')}/${pid ? pid : 1}`;
                },
            },
            {
                title: '番剧',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/bangumi/media/:bid',
                target: (params) => `/bilibili/bangumi/media/${params.bid.replace('md', '')}`,
            },
        ],
        space: [
            {
                title: 'UP 主动态',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/dynamic/:uid',
            },
            {
                title: 'UP 主投稿',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/video/:uid',
            },
            {
                title: 'UP 主专栏',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/article/:uid',
            },
            {
                title: 'UP 主默认收藏夹',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/fav/:uid',
            },
            {
                title: 'UP 主投币视频',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/coin/:uid',
            },
            {
                title: 'UP 主粉丝',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/followers/:uid',
            },
            {
                title: 'UP 主关注用户',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/followings/:uid',
            },
            {
                title: '用户追番列表',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili',
                source: '/:uid',
                target: '/bilibili/user/bangumi/:uid',
            },
        ],
        manga: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/social-media.html#bilibili-man-hua-geng-xin',
                source: '/detail/:comicid',
                target: '/bilibili/manga/update/:comicid',
            },
        ],
        live: [
            {
                title: '直播开播',
                docs: 'https://docs.rsshub.app/live.html#bi-li-bi-li-zhi-bo-zhi-bo-kai-bo',
                source: ['/:roomID'],
                target: '/bilibili/live/room/:roomID',
            },
        ],
    },
};
