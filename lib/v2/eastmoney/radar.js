module.exports = {
    'eastmoney.com': {
        _name: '东方财富',
        data: [
            {
                title: '研究报告',
                docs: 'https://docs.rsshub.app/finance.html#dong-fang-cai-fu',
                source: ['/report/:category'],
                target: '/eastmoney/report/:category',
            },
        ],
        fundbarmob: [
            {
                title: '天天基金用户动态',
                docs: 'https://docs.rsshub.app/finance.html#dong-fang-cai-fu',
                source: ['/'],
                target: (_param, url) => `/eastmoney/ttjj/user/${new URL(url).searchParams.get('userid')}`,
            },
        ],
        so: [
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/finance.html#dong-fang-cai-fu',
                source: ['/News/s'],
                target: (_param, url) => `/eastmoney/search/${new URL(url).searchParams.get('KeyWord')}`,
            },
        ],
    },
};
