module.exports = {
    'qidiantu.com': {
        _name: '起点图',
        '.': [
            {
                title: '首订',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian-tu-shou-ding',
                source: ['/shouding', '/'],
                target: '/qidiantu/shouding',
            },
            {
                title: '榜单',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian-tu-bang-dan',
                source: ['/bang/:category/:type', '/'],
                target: '/qidiantu/:category?/:type?/:is_history?',
            },
        ],
    },
};
