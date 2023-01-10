module.exports = {
    'baidu.com': {
        _name: '百度',
        gushitong: [
            {
                title: '首页指数',
                docs: 'https://docs.rsshub.app/finance.html#bai-du-gu-shi-tong',
                source: ['/'],
                target: '/baidu/gushitong/index',
            },
        ],
        tieba: [
            {
                title: '帖子列表',
                docs: 'https://docs.rsshub.app/bbs.html#bai-du-tie-ba',
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
                docs: 'https://docs.rsshub.app/bbs.html#bai-du-tie-ba',
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
                docs: 'https://docs.rsshub.app/bbs.html#bai-du-tie-ba',
                source: '/p/:id',
                target: '/baidu/tieba/post/:id',
            },
            {
                title: '只看楼主',
                docs: 'https://docs.rsshub.app/bbs.html#bai-du-tie-ba',
                source: '/p/:id',
                target: '/baidu/tieba/post/lz/:id',
            },
            {
                title: '用户帖子',
                docs: 'https://docs.rsshub.app/bbs.html#tie-ba',
                source: '/home/main',
                target: (params, url) => {
                    const uid = new URL(url).searchParams.get('un');
                    if (uid) {
                        return `/baidu/tieba/user/${uid}`;
                    }
                },
            },
        ],
    },
};
