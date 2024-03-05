export default {
    'dedao.cn': {
        _name: '得到',
        '.': [
            {
                title: '知识城邦',
                docs: 'https://docs.rsshub.app/routes/new-media#de-dao-zhi-shi-cheng-bang',
                source: ['/knowledge/topic/:topic', '/knowledge', '/'],
                target: '/dedao/knowledge/:topic?/:type?',
            },
        ],
    },
    'igetget.com': {
        _name: '得到',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/new-media#de-dao-shou-ye',
                source: ['/'],
                target: '/dedao/list/:category?',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#de-dao-xin-wen',
                source: ['/news', '/'],
                target: '/dedao/news',
            },
            {
                title: '人物故事',
                docs: 'https://docs.rsshub.app/routes/new-media#de-dao-ren-wu-gu-shi',
                source: ['/news', '/'],
                target: '/dedao/figure',
            },
            {
                title: '视频',
                docs: 'https://docs.rsshub.app/routes/new-media#de-dao-shi-pin',
                source: ['/video', '/'],
                target: '/dedao/video',
            },
        ],
        m: [
            {
                title: '用户主页',
                docs: 'https://docs.rsshub.app/routes/new-media#de-dao-yong-hu-zhu-ye',
                source: ['/native/mine/account', '/'],
                target: (params, url) => `/dedao/user/${new URL(url).searchParams.get('enId')}`,
            },
        ],
    },
};
