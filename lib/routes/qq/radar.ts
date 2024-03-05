export default {
    'qq.com': {
        _name: '腾讯网',
        ac: [
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/routes/anime#teng-xun-dong-man-pai-hang-bang',
                source: ['/Rank/comicRank/type/:type', '/'],
                target: '/qq/ac/rank/:type?/:time?',
            },
            {
                title: '漫画',
                docs: 'https://docs.rsshub.app/routes/anime#teng-xun-dong-man-man-hua',
                source: ['/Comic/ComicInfo/id/:id', '/'],
                target: '/qq/ac/comic/:id',
            },
        ],
        'node.kg': [
            {
                title: '用户作品列表 - 全民 K 歌',
                docs: 'https://docs.rsshub.app/routes/live#qi-e-zhi-bo-zhi-bo-jian-ti-xing',
                source: ['/personal'],
                target: (_params, url) => `/qq/kg/${new URL(url).searchParams.get('uid')}`,
            },
            {
                title: '用户作品评论动态 - 全民 K 歌',
                docs: 'https://docs.rsshub.app/routes/live#qi-e-zhi-bo-zhi-bo-jian-ti-xing',
                source: ['/play'],
                target: (_params, url) => `/qq/kg/${new URL(url).searchParams.get('s')}`,
            },
        ],
        'vp.fact': [
            {
                title: '最新辟谣',
                docs: 'https://docs.rsshub.app/routes/other#teng-xun-xin-wen-jiao-zhen-cha-zheng-ping-tai',
                source: ['/home', '/'],
                target: '/qq/fact',
            },
        ],
    },
};
