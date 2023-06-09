module.exports = {
    'xyzrank.com': {
        _name: '中文播客榜',
        '.': [
            {
                title: '热门节目',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-re-men-jie-mu',
                source: ['/'],
                target: '/xyzrank',
            },
            {
                title: '热门播客',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-re-men-bo-ke',
                source: ['/'],
                target: (_, url) => (new URL(url).hash === '#/hot-podcasts' ? '/xyzrank/hot-podcasts' : null),
            },
            {
                title: '新锐节目',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-xin-rui-jie-mu',
                source: ['/'],
                target: (_, url) => (new URL(url).hash === '#/hot-episodes-new' ? '/xyzrank/hot-episodes-new' : null),
            },
            {
                title: '新锐播客',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-xin-rui-bo-ke',
                source: ['/'],
                target: (_, url) => (new URL(url).hash === '#/new-podcasts' ? '/xyzrank/new-podcasts' : null),
            },
        ],
    },
};
