module.exports = {
    'nikkei.com': {
        _name: '日本经济新闻',
        asia: [
            {
                title: 'Latest News',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen',
                source: '/',
                target: '/nikkei/asia',
            },
        ],
        cn: [
            {
                title: '中文版新闻',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen-zhong-wen-ban-xin-wen',
                source: ['/:category/:type', '/:category', '/'],
                target: (params) => {
                    if (params.category && params.type) {
                        return `/nikkei/cn/cn/${params.category}/${params.type.replace('.html', '')}`;
                    } else if (params.category && !params.type) {
                        return `/nikkei/cn/cn/${params.category.replace('.html', '')}`;
                    } else {
                        return `/nikkei/cn/cn`;
                    }
                },
            },
        ],
        www: [
            {
                title: 'ホームページ',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen',
                source: '/',
                target: '/nikkei/index',
            },
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen',
                source: ['/:category/archive', '/:category'],
                target: '/nikkei/:category',
            },
        ],
        'zh.cn': [
            {
                title: '中文版新聞',
                docs: 'https://docs.rsshub.app/traditional-media.html#ri-ben-jing-ji-xin-wen-zhong-wen-ban-xin-wen',
                source: ['/:category/:type', '/:category', '/'],
                target: (params) => {
                    if (params.category && params.type) {
                        return `/nikkei/cn/zh/${params.category}/${params.type.replace('.html', '')}`;
                    } else if (params.category && !params.type) {
                        return `/nikkei/cn/zh/${params.category.replace('.html', '')}`;
                    } else {
                        return `/nikkei/cn/zh`;
                    }
                },
            },
        ],
    },
};
