export default {
    'baidu.com': {
        _name: '百度',
        www: [
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/other#bai-du-sou-suo',
                source: ['/'],
                target: (params, url) => {
                    const keyword = new URL(url).searchParams.get('wd');
                    return `/baidu/search/${keyword}`;
                },
            },
        ],
        gushitong: [
            {
                title: '首页指数',
                docs: 'https://docs.rsshub.app/routes/finance#bai-du-gu-shi-tong',
                source: ['/'],
                target: '/baidu/gushitong/index',
            },
        ],
        tieba: [
            {
                title: '帖子列表',
                docs: 'https://docs.rsshub.app/routes/bbs#bai-du-tie-ba',
                source: 'f',
                target: (params, url) => {
                    const type = new URL(url).searchParams.get('tab');
                    if (!type || type === 'main') {
                        return `/baidu/tieba/forum/${new URL(url).searchParams.get('kw')}`;
                    }
                },
            },
            {
                title: '精品帖子',
                docs: 'https://docs.rsshub.app/routes/bbs#bai-du-tie-ba',
                source: 'f',
                target: (params, url) => {
                    const type = new URL(url).searchParams.get('tab');
                    if (type === 'good') {
                        return `/baidu/tieba/forum/good/${new URL(url).searchParams.get('kw')}`;
                    }
                },
            },
            {
                title: '帖子动态',
                docs: 'https://docs.rsshub.app/routes/bbs#bai-du-tie-ba',
                source: '/p/:id',
                target: '/baidu/tieba/post/:id',
            },
            {
                title: '只看楼主',
                docs: 'https://docs.rsshub.app/routes/bbs#bai-du-tie-ba',
                source: '/p/:id',
                target: '/baidu/tieba/post/lz/:id',
            },
            {
                title: '用户帖子',
                docs: 'https://docs.rsshub.app/routes/bbs#bai-du-tie-ba',
                source: '/home/main',
                target: (params, url) => {
                    const uid = new URL(url).searchParams.get('un');
                    if (uid) {
                        return `/baidu/tieba/user/${uid}`;
                    }
                },
            },
            {
                title: '贴吧搜索',
                docs: 'https://docs.rsshub.app/routes/bbs#bai-du-tie-ba',
                source: '/f/search/res',
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    const qw = searchParams.get('qw');
                    const kw = searchParams.get('kw');
                    if (qw) {
                        const route = `/baidu/tieba/search/${qw}`;
                        return kw ? `${route}/kw=${kw}` : route;
                    }
                },
            },
        ],
        top: [
            {
                title: '热搜榜单',
                docs: 'https://docs.rsshub.app/routes/other#bai-du-re-sou-bang-dan',
                source: ['/board'],
                target: (_, url) => `/baidu/top/${new URL(url).searchParams.get('tab')}`,
            },
        ],
    },
};
