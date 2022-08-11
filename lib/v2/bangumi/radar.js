module.exports = {
    '萌番组 Bangumi Moe': {
        _name: 'bangumi.moe',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/anime.html#meng-fan-zu-zui-xin',
                source: ['/'],
                target: '/bangumi',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/anime.html#meng-fan-zu-biao-qian',
                source: ['/search/index'],
                target: '/bangumi/:tags?',
            },
        ],
    },
};
