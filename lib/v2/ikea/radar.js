module.exports = {
    'ikea.com': {
        _name: 'IKEA 宜家',
        '.': [
            {
                title: '英国 - 商品上新',
                docs: 'https://docs.rsshub.app/shopping.html#ikea-yi-jia',
                source: ['/gb/en/new/new-products/', '/'],
                target: '/ikea/gb/new',
            },
            {
                title: '英国 - 促销',
                docs: 'https://docs.rsshub.app/shopping.html#ikea-yi-jia',
                source: ['/gb/en/offers', '/'],
                target: '/ikea/gb/offer',
            },
        ],
    },
    'ikea.cn': {
        _name: 'IKEA 宜家',
        '.': [
            {
                title: '中国 - 当季新品推荐',
                docs: 'https://docs.rsshub.app/shopping.html#ikea-yi-jia',
                source: ['/cn/zh/new/', '/'],
                target: '/ikea/cn/new',
            },
            {
                title: '中国 - 低价优选',
                docs: 'https://docs.rsshub.app/shopping.html#ikea-yi-jia',
                source: ['/cn/zh/campaigns/wo3-men2-de-chao1-zhi2-di1-jia4-pub8b08af40', '/'],
                target: '/ikea/cn/low_price',
            },
            {
                title: '中国 - 会员特惠',
                docs: 'https://docs.rsshub.app/shopping.html#ikea-yi-jia',
                source: ['/cn/zh/offers/family-offers', '/'],
                target: '/ikea/cn/family_offers',
            },
        ],
    },
};
