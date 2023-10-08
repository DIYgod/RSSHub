module.exports = {
    'tesla.cn': {
        _name: '特斯拉中国',
        '.': [
            {
                title: '价格',
                docs: 'https://docs.rsshub.app/routes/shopping#te-si-la-zhong-guo-jia-ge',
                source: ['/model3/design', '/'],
                target: '/tesla/price',
            },
        ],
        cx: [
            {
                title: '权益中心',
                docs: 'https://docs.rsshub.app/routes/shopping#te-si-la-zhong-guo-quan-yi-zhong-xin',
                source: ['/user-right/list/:category'],
                target: (params) => {
                    const category = params.category;

                    return `/tesla/cx${category ? `/${category}` : ''}`;
                },
            },
        ],
    },
};
