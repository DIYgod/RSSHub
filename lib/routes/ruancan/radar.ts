export default {
    'ruancan.com': {
        _name: '软餐',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/routes/new-media#ruan-can-shou-ye',
                source: ['/'],
                target: '/ruancan',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#ruan-can-fen-lei',
                source: ['/cat/:category', '/'],
                target: '/ruancan/category/:category',
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/new-media#ruan-can-sou-suo',
                source: ['/'],
                target: (params, url) => `/ruancan/search/${new URL(url).searchParams.get('s')}`,
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/routes/new-media#ruan-can-yong-hu-wen-zhang',
                source: ['/i/:id', '/'],
                target: '/ruancan/user/:id',
            },
        ],
    },
};
