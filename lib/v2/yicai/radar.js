module.exports = {
    'yicai.com': {
        _name: '第一财经',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-zui-xin',
                source: ['/'],
                target: '/yicai/latest',
            },
            {
                title: '头条',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-tou-tiao',
                source: ['/'],
                target: '/yicai/headline',
            },
            {
                title: 'VIP 频道',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-vip-pin-dao',
                source: ['/vip/product/:id', '/'],
                target: '/yicai/vip/:id',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-xin-wen',
                source: ['/news/:id', '/news'],
                target: '/yicai/news/:id',
            },
            {
                title: '关注',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-guan-zhu',
                source: ['/feed/:id', '/feed'],
                target: '/yicai/feed/:id',
            },
            {
                title: '视听',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-shi-ting',
                source: ['/video/:id', '/video'],
                target: '/yicai/video/:id',
            },
            {
                title: '正在',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-zheng-zai',
                source: ['/brief'],
                target: '/yicai/brief',
            },
            {
                title: '一财号',
                docs: 'https://docs.rsshub.app/traditional-media.html#di-yi-cai-jing-yi-cai-hao',
                source: ['/author/:id', '/author'],
                target: '/yicai/author/:id',
            },
        ],
    },
};
