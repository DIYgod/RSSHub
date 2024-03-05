const bangumiTV = {
    _name: 'Bangumi 番组计划',
    '.': [
        {
            title: '小组话题',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/group/:id',
            target: '/bangumi/tv/group/:id',
        },
        {
            title: '小组话题的新回复',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/group/topic/:id',
            target: '/bangumi/tv/topic/:id',
        },
        {
            title: '现实人物的新作品',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/person/:id',
            target: '/bangumi/tv/person/:id',
        },
        {
            title: '用户日志',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/user/:id',
            target: '/bangumi/tv/user/blog/:id',
        },
        {
            title: '条目的讨论',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/subject/:id',
            target: '/bangumi/tv/subject/:id/topics',
        },
        {
            title: '条目的评论',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/subject/:id',
            target: '/bangumi/tv/subject/:id/blogs',
        },
        {
            title: '条目的章节',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/subject/:id',
            target: '/bangumi/tv/subject/:id',
        },
        {
            title: '条目的吐槽箱',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/subject/:id',
            target: '/bangumi/tv/subject/:id/comments',
        },
        {
            title: '放送列表',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/calendar',
            target: '/bangumi/tv/calendar/today',
        },
        {
            title: '成员关注动画榜',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/anime',
            target: '/bangumi/tv/followrank',
        },
        {
            title: '用户想看',
            docs: 'https://docs.rsshub.app/routes/anime#bangumi-fan-zu-ji-hua',
            source: '/anime/list/:id/wish',
            target: '/bangumi/tv/user/wish/:id',
        },
    ],
};

export default {
    'bangumi.moe': {
        _name: '萌番組',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/routes/anime#meng-fan-zu-zui-xin',
                source: ['/'],
                target: '/bangumi/moe',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/anime#meng-fan-zu-biao-qian',
                source: ['/search/index'],
                target: '/bangumi/moe/:tags?',
            },
        ],
    },
    'bangumi.online': {
        _name: 'アニメ新番組',
        '.': [
            {
                title: '當季新番',
                docs: 'https://docs.rsshub.app/routes/anime#アニメ-xin-fan-zu-dang-ji-xin-fan',
                source: ['/'],
                target: '/bangumi/online',
            },
        ],
    },
    'bangumi.tv': bangumiTV,
    'bgm.tv': bangumiTV,
};
