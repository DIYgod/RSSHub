module.exports = {
    'stats.gov.cn': {
        _name: '国家统计局',
        std: [
            {
                title: '国家统计局 > 统计数据 > 最新发布',
                docs: 'https://docs.rsshub.app/government.html#guo-jia-tong-ji-ju',
                source: ['/tjsj/zxfb'],
                target: () => `/statsgov/zxfb`,
            },
        ],
    },
};
