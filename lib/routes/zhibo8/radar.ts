export default {
    'zhibo8.cc': {
        _name: '直播吧',
        '.': [
            {
                title: '录像',
                docs: 'https://docs.rsshub.app/routes/multimedia#zhi-bo-ba',
                source: ['/:category/luxiang.htm'],
                target: '/zhibo8/luxiang/:category',
            },
        ],
        bbs: [
            {
                title: '子论坛',
                docs: 'https://docs.rsshub.app/routes/bbs#zhi-bo-ba',
                source: ['/'],
                target: (_params, url) => `/zhibo8/forum/${new URL(url).searchParams.get('fid')}`,
            },
            {
                title: '回帖',
                docs: 'https://docs.rsshub.app/routes/bbs#zhi-bo-ba',
                source: ['/'],
                target: (_params, url) => `/zhibo8/post/${new URL(url).searchParams.get('tid')}`,
            },
        ],
        news: [
            {
                title: '滚动新闻',
                docs: 'https://docs.rsshub.app/routes/bbs#zhi-bo-ba',
                source: ['/:category'],
                target: '/zhibo8/more/:category',
            },
        ],
    },
};
