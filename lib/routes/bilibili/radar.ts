export default {
    'bilibili.com': {
        _name: 'bilibili',
        www: [
            {
                title: '分区视频',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: ['/v/*tpath', '/documentary', '/movie', '/tv'],
            },
            {
                title: '视频评论',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/video/:aid',
                target: (params) => `/bilibili/video/reply/${params.aid.replace('av', '')}`,
            },
            {
                title: '视频弹幕',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/video/:aid',
                target: (params, url) => {
                    const pid = new URL(url).searchParams.get('p');
                    return `/bilibili/video/danmaku/${params.aid.replace('av', '')}/${pid ?? 1}`;
                },
            },
            {
                title: '番剧',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/bangumi/media/:bid',
                target: (params) => `/bilibili/bangumi/media/${params.bid.replace('md', '')}`,
            },
            {
                title: '当前在线',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/video/online.html',
                target: '/bilibili/online',
            },
            {
                title: '热搜',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/',
                target: '/bilibili/hot-search',
            },
            {
                title: '频道排行榜',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/v/channel/:channelid/',
                target: '/bilibili/channel/:channelid/hot',
            },
        ],
        space: [
            {
                title: 'UP 主动态',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/dynamic/:uid',
            },
            {
                title: 'UP 主投稿',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/video/:uid',
            },
            {
                title: 'UP 主频道的合集',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid/channel/collectiondetail',
                target: (params, url) => {
                    const sid = new URL(url).searchParams.get('sid');
                    return `/bilibili/user/collection/${params.uid}/${sid}`;
                },
            },
            {
                title: 'UP 主频道的视频列表',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid/channel/seriesdetail',
                target: (params, url) => {
                    const sid = new URL(url).searchParams.get('sid');
                    return `/bilibili/user/channel/${params.uid}/${sid}`;
                },
            },
            {
                title: 'UP 主专栏',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/article/:uid',
            },
            {
                title: 'UP 主默认收藏夹',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: ['/:uid', '/:uid/favlist'],
                target: '/bilibili/user/fav/:uid',
            },
            {
                title: 'UP 主非默认收藏夹',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid/favlist',
                target: (params, url) => `/bilibili/fav/${params.uid}/${new URL(url).searchParams.get('fid')}`,
            },
            {
                title: 'UP 主投币视频',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/coin/:uid',
            },
            {
                title: 'UP 主点赞视频',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/like/:uid',
            },
            {
                title: 'UP 主粉丝',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/followers/:uid',
            },
            {
                title: 'UP 主关注用户',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/followings/:uid',
            },
            {
                title: '用户追番列表',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili',
                source: '/:uid',
                target: '/bilibili/user/bangumi/:uid',
            },
        ],
        manga: [
            {
                title: '漫画更新',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili-man-hua-geng-xin',
                source: '/detail/:comicid',
                target: '/bilibili/manga/update/:comicid',
            },
        ],
        live: [
            {
                title: '直播开播',
                docs: 'https://docs.rsshub.app/routes/live#bi-li-bi-li-zhi-bo-zhi-bo-kai-bo',
                source: ['/:roomID'],
                target: '/bilibili/live/room/:roomID',
            },
        ],
        show: [
            {
                title: '会员购票务',
                docs: 'https://docs.rsshub.app/routes/social-media#bilibili-hui-yuan-gou-zuo-pin',
                source: '/platform',
                target: '/bilibili/platform/:area?/:p_type?/:uid?',
            },
        ],
    },
};
