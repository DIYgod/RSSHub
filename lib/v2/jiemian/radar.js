module.exports = {
    'jiemian.com': {
        _name: '界面新闻',
        '.': [
            {
                title: '快报',
                docs: 'https://docs.rsshub.app/traditional-media.html#jie-mian-xin-wen-kuai-bao',
                source: ['/list/:id', '/'],
                target: '/jiemian',
            },
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/traditional-media.html#jie-mian-xin-wen-lan-mu',
                source: ['/list/:id', '/'],
                target: '/jiemian/list/:id',
            },
        ],
    },
};
