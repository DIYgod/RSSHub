module.exports = {
    'shopback.com.tw': {
        _name: 'ShopBack',
        '.': [
            {
                title: 'Store',
                docs: 'https://docs.rsshub.app/shopping.html#shopback-store',
                source: ['/:category', '/'],
                target: '/shopback/:store',
            },
        ],
    },
};
