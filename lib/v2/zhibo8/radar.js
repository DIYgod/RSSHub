module.exports = {
    'zhibo8.cc': {
        _name: '直播吧',
        bbs: [
            {
                title: '子论坛',
                docs: 'https://docs.rsshub.app/bbs.html#zhi-bo-ba',
                source: ['/'],
                target: (_params, url) => `/zhibo8/forum/${new URL(url).searchParams.get('fid')}`,
            },
            {
                title: '回帖',
                docs: 'https://docs.rsshub.app/bbs.html#zhi-bo-ba',
                source: ['/'],
                target: (_params, url) => `/zhibo8/post/${new URL(url).searchParams.get('tid')}`,
            },
        ],
        news: [
            {
                title: '滚动新闻',
                docs: 'https://docs.rsshub.app/bbs.html#zhi-bo-ba',
                source: ['/:category'],
                target: '/zhibo8/more/:category',
            },
        ],
    },
};
