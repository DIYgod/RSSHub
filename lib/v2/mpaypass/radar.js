module.exports = {
    'mpaypass.com.cn': {
        _name: '移动支付网',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/new-media.html#yi-dong-zhi-fu-wang',
                source: '/',
                target: '/mpaypass/news',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#yi-dong-zhi-fu-wang',
                source: ['/:type', '/'],
                target: (params) => `/mpaypass/main/${params.type.replace('.html', '')}`,
            },
        ],
    },
};
