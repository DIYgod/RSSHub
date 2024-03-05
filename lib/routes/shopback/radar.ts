export default {
    'shopback.com.tw': {
        _name: 'ShopBack',
        '.': [
            {
                title: 'Store',
                docs: 'https://docs.rsshub.app/routes/shopping#shopback-store',
                source: ['/:category', '/'],
                target: '/shopback/:store',
            },
        ],
    },
};
