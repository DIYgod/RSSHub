export default {
    'guancha.cn': {
        _name: '观察者网',
        '.': [
            {
                title: '头条',
                docs: 'https://docs.rsshub.app/routes/new-media#guan-cha-zhe-wang-tou-tiao',
                source: ['/GuanChaZheTouTiao', '/'],
                target: '/guancha/headline',
            },
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/new-media#guan-cha-zhe-wang-shou-ye',
                source: ['/'],
                target: '/guancha/:category?',
            },
            {
                title: '观学院',
                docs: 'https://docs.rsshub.app/routes/new-media#guan-cha-zhe-wang-guan-xue-yuan',
                source: ['/'],
                target: '/guancha/:category?',
            },
        ],
        app: [
            {
                title: '个人主页文章',
                docs: 'https://docs.rsshub.app/routes/new-media#guan-cha-zhe-wang-ge-ren-zhu-ye-wen-zhang',
                source: ['/user/get-published-list', '/'],
                target: (params, url) => `/guancha/personalpage/${new URL(url).searchParams.get('uid')}`,
            },
        ],
        member: [
            {
                title: '观学院',
                docs: 'https://docs.rsshub.app/routes/new-media#guan-cha-zhe-wang-guan-xue-yuan',
                source: ['/'],
                target: '/guancha/member/recommend',
            },
        ],
        user: [
            {
                title: '风闻话题',
                docs: 'https://docs.rsshub.app/routes/new-media#guan-cha-zhe-wang-feng-wen-hua-ti',
                source: ['/topic/post-list', '/'],
                target: (params, url) => `/guancha/topic/${new URL(url).searchParams.get('topic_id')}/${new URL(url).searchParams.get('order')}`,
            },
        ],
    },
};
