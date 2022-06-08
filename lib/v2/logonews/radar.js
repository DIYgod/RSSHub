module.exports = {
    'logonews.cn': {
        _name: 'LogoNews 标志情报局',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/design.html#logonews-biao-zhi-qing-bao-ju-shou-ye',
                source: ['/'],
                target: '/logonews',
            },
            {
                title: '文章分类',
                docs: 'https://docs.rsshub.app/design.html#logonews-biao-zhi-qing-bao-ju-wen-zhang-fen-lei',
                source: ['/category/:category/:type?'],
                target: '/logonews/category/:category/:type?',
            },
            {
                title: '文章标签',
                docs: 'https://docs.rsshub.app/design.html#logonews-biao-zhi-qing-bao-ju-wen-zhang-biao-qian',
                source: ['/tag/:tag'],
                target: '/logonews/tag/:tag',
            },
            {
                title: '作品',
                docs: 'https://docs.rsshub.app/design.html#logonews-biao-zhi-qing-bao-ju-zuo-pin',
                source: ['/work'],
                target: '/logonews/work',
            },
            {
                title: '作品分类',
                docs: 'https://docs.rsshub.app/design.html#logonews-biao-zhi-qing-bao-ju-zuo-pin-fen-lei',
                source: ['/work/categorys/:category'],
                target: '/logonews/work/categorys/:category',
            },
            {
                title: '作品标签',
                docs: 'https://docs.rsshub.app/design.html#logonews-biao-zhi-qing-bao-ju-zuo-pin-biao-qian',
                source: ['/work/tags/:tag'],
                target: '/logonews/work/tags/:tag',
            },
        ],
    },
};
