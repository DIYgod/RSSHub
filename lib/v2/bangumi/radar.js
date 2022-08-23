module.exports = {
    'bangumi.moe': {
        _name: '萌番組',
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
    'bangumi.online': {
        _name: 'アニメ新番組',
        '.': [
            {
                title: '當季新番',
                docs: 'https://docs.rsshub.app/anime.html#アニメ-xin-fan-zu-dang-ji-xin-fan',
                source: ['/'],
                target: '/bangumi/online',
            },
        ],
    },
};
