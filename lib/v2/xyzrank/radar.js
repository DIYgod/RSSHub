module.exports = {
    'xyzrank.com': {
        _name: '中文播客榜',
        '.': [
            {
                title: '热门节目',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-re-men-jie-mu',
                source: ['/#/', '/'],
                target: '/xyzrank',
            },
            {
                title: '热门播客',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-re-men-bo-ke',
                source: ['/#/hot-podcasts', '/'],
                target: '/xyzrank/hot-podcasts',
            },
            {
                title: '新锐节目',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-xin-rui-jie-mu',
                source: ['/#/hot-episodes-new', '/'],
                target: '/xyzrank/hot-episodes-new',
            },
            {
                title: '新锐播客',
                docs: 'https://docs.rsshub.app/multimedia.html#zhong-wen-bo-ke-bang-xin-rui-bo-ke',
                source: ['/#/new-podcasts', '/'],
                target: '/xyzrank/new-podcasts',
            },
        ],
    },
};
