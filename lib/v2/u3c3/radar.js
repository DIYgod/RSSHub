module.exports = {
    'u3c3.com': {
        _name: 'u3c3',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/multimedia.html#u3c3-fen-lei',
                source: '/',
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    const type = searchParams.has('type') ? searchParams.get('type') : '';
                    return `/u3c3/${type}`;
                },
            },
            {
                title: '关键词搜索',
                docs: 'https://docs.rsshub.app/multimedia.html#u3c3-guan-jian-ci-sou-suo',
                source: '/',
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    if (searchParams.has('search')) {
                        const keyword = searchParams.get('search');
                        return `/u3c3/search/${keyword}`;
                    }
                },
            },
        ],
    },
};
