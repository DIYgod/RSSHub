export default {
    'toutiao.com': {
        _name: '今日头条',
        so: [
            {
                title: '热搜关键词聚合追踪',
                docs: 'https://docs.rsshub.app/routes/social-media#re-sou-ju-he',
                source: ['/search'],
                target: (params, url) => `/trending/${new URL(url).searchParams.get('keyword')}`,
            },
        ],
    },
    'weibo.com': {
        _name: '微博',
        s: [
            {
                title: '热搜关键词聚合追踪',
                docs: 'https://docs.rsshub.app/routes/social-media#re-sou-ju-he',
                source: '/weibo/:keyword',
                target: (params) => `/trending/${params.keyword}}`,
            },
        ],
    },
    'zhihu.com': {
        _name: '知乎',
        www: [
            {
                title: '热搜关键词聚合追踪',
                docs: 'https://docs.rsshub.app/routes/social-media#re-sou-ju-he',
                source: ['/search'],
                target: (params, url) => `/trending/${new URL(url).searchParams.get('q')}`,
            },
        ],
    },
};
