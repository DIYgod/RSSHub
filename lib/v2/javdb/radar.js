module.exports = {
    'javdb.com': {
        _name: 'JavDB',
        '.': [
            {
                title: '主页',
                docs: 'https://docs.rsshub.app/multimedia.html#javdb-zhu-ye',
                source: ['/'],
                target: '/javdb',
            },
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/multimedia.html#javdb-fen-lei',
                source: ['/tags/:category', '/'],
                target: (params, url) => `/javdb/tags/:category/${new URL(url).searchParams.toString()}`,
            },
            {
                title: '排行榜',
                docs: 'https://docs.rsshub.app/multimedia.html#javdb-pai-hang-bang',
                source: ['/rankings/:category', '/'],
                target: (params, url) => `/javdb/rankings/:category/${new URL(url).searchParams.get('period') ?? ''}`,
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/multimedia.html#javdb-sou-suo',
                source: ['/search', '/'],
                target: (params, url) => `/javdb/search/${new URL(url).searchParams.toString()}`,
            },
            {
                title: '演員',
                docs: 'https://docs.rsshub.app/multimedia.html#javdb-yan-yuan',
                source: ['/actors/:id', '/'],
                target: (params, url) => `/javdb/actors/:id/${new URL(url).searchParams.toString()}`,
            },
            {
                title: '系列',
                docs: 'https://docs.rsshub.app/multimedia.html#javdb-xi-lie',
                source: ['/series/:id', '/'],
                target: (params, url) => `/javdb/series/:id/${new URL(url).searchParams.toString()}`,
            },
            {
                title: '片商',
                docs: 'https://docs.rsshub.app/multimedia.html#javdb-pian-shang',
                source: ['/makers/:id', '/'],
                target: (params, url) => `/javdb/makers/:id/${new URL(url).searchParams.toString()}`,
            },
        ],
    },
};
