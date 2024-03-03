export default {
    'bse.cn': {
        _name: '北京证券交易所',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/finance#bei-jing-zheng-quan-jiao-yi-suo-lan-mu',
                source: ['/'],
                target: '/bse/:category?/:keyword?',
            },
        ],
    },
};
