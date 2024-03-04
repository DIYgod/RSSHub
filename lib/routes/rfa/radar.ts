export default {
    'rfa.org': {
        _name: '自由亚洲电台',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#zi-you-ya-zhou-dian-tai',
                source: '/:language/:channel/:subChannel',
                target: '/rfa/:language/:channel/:subChannel',
            },
        ],
    },
};
