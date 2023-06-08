module.exports = {
    'cneb.gov.cn': {
        _name: '中国国家应急广播',
        '.': [
            {
                title: '应急新闻',
                docs: 'https://docs.rsshub.app/forecast.html#zhong-guo-guo-jia-ying-ji-guang-bo',
                source: ['/yjxw/:category?', '/'],
                target: '/cneb/yjxw/:category?',
            },
            {
                title: '预警信息',
                docs: 'https://docs.rsshub.app/forecast.html#zhong-guo-guo-jia-ying-ji-guang-bo',
                source: ['/yjxx', '/'],
                target: '/cneb/yjxx',
            },
        ],
    },
};
