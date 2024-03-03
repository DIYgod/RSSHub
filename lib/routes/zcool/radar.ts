export default {
    'zcool.com.cn': {
        _name: '站酷',
        www: [
            {
                title: '发现',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: ['/discover', '/'],
                target: (params, url) => `/zcool/discover/${new URL(url).toString().split('?').pop()}`,
            },
            {
                title: '发现 - 精选 - 全部推荐',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: '/',
                target: '/zcool/discover/all',
            },
            {
                title: '发现 - 精选 - 首页推荐',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: '/',
                target: '/zcool/discover/home',
            },
            {
                title: '发现 - 精选 - 编辑精选',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: '/',
                target: '/zcool/discover/home',
            },
            {
                title: '发现 - 精选 - 文章 - 编辑精选',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: '/',
                target: '/zcool/discover/article',
            },
            {
                title: '作品榜单',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: '/',
                target: '/zcool/top/design',
            },
            {
                title: '文章榜单',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: '/',
                target: '/zcool/top/article',
            },
            {
                title: '用户作品',
                docs: 'https://docs.rsshub.app/routes/design#zhan-ku',
                source: ['/u/:id'],
                target: `/zcool/user/:id`,
            },
        ],
    },
};
