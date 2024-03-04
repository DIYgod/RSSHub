// @ts-nocheck
// 排行榜基本数据
const DATA_MAP = {
    bh2: {
        title: '崩坏学园2',
        gids: 3,
        default_forum: 'tongren',
        default_ranking_type: 'weekly',
        forums: {
            tongren: {
                title: '同人',
                forum_id: 40,
            },
        },
    },
    bh3: {
        title: '崩坏3',
        gids: 1,
        default_forum: 'tongren',
        forums: {
            tongren: {
                title: '同人',
                forum_id: 4,
                default_cate: 'illustration',
                cates: {
                    comic: {
                        title: '漫画',
                        cate_id: 3,
                    },
                    illustration: {
                        title: '插画',
                        cate_id: 4,
                    },
                    cos: {
                        title: 'COS',
                        cate_id: 17,
                    },
                },
            },
        },
    },
    ys: {
        title: '原神',
        gids: 2,
        default_forum: 'tongren',
        forums: {
            tongren: {
                title: '同人',
                forum_id: 29,
                default_cate: 'illustration',
                cates: {
                    manual: {
                        title: '手工',
                        cate_id: 1,
                    },
                    qute: {
                        title: 'Q版',
                        cate_id: 2,
                    },
                    comic: {
                        title: '漫画',
                        cate_id: 3,
                    },
                    illustration: {
                        title: '插画',
                        cate_id: 4,
                    },
                },
            },
            cos: {
                title: 'COS',
                forum_id: 49,
            },
        },
    },
    wd: {
        title: '未定事件簿',
        gids: 4,
        default_forum: 'tongren',
        forums: {
            tongren: {
                title: '同人',
                forum_id: 38,
            },
        },
    },
    sr: {
        title: '崩坏：星穹铁道',
        gids: 6,
        default_forum: 'tongren',
        forums: {
            tongren: {
                title: '同人',
                forum_id: 56,
            },
        },
    },
    zzz: {
        title: '绝区零',
        gids: 8,
    },
    dby: {
        title: '大别野',
        gids: 5,
        default_forum: 'tongren',
        forums: {
            tongren: {
                title: '同人',
                forum_id: 39,
            },
            cos: {
                title: 'COS',
                forum_id: 47,
            },
        },
    },
};

// 排行榜分类
const RANKING_TYPE_MAP = {
    daily: {
        id: 1,
        title: '日榜',
    },
    weekly: {
        id: 2,
        title: '周榜',
    },
    monthly: {
        id: 3,
        title: '月榜',
    },
};

module.exports = {
    DATA_MAP,
    RANKING_TYPE_MAP,
};
