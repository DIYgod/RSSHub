module.exports = {
    'oreno3d.com': {
        _name: 'oreno3d',
        '.': [
            {
                title: '关键词搜索',
                docs: 'https://docs.rsshub.app/anime.htm#an-の3dエロ-dong-hua-oreno3d-guan-jian-ci-sou-suo',
                source: '/search',
                target: (_, url) => {
                    const searchParams = new URL(url).searchParams;
                    const sort = searchParams.get('sort') ?? 'hot';
                    const keyword = searchParams.get('keyword');
                    const page = searchParams.get("page") ?? '1';
                    return `/oreno3d/search?sort=${sort}&keyword=${keyword}&page=${page}`;
                },
            },
            {
                title: '角色搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-jiao-se-sou-suo',
                source: '/characters/:characterid',
                target: (params, url) => {
                    const sort = new URL(url).searchParams.get('sort') ?? 'hot';
                    const page = new URL(url).searchParams.get("page") ?? '1';
                    return `/oreno3d/characters/${params}?sort=${sort}&page=${page}`;
                },
            },
            {
                title: '作者搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-zuo-zhe-sou-suo',
                source: '/authors/:authorid',
                target: (params, url) => {
                    const sort = new URL(url).searchParams.get('sort') ?? 'hot';
                    const page = new URL(url).searchParams.get("page") ?? '1';
                    return `/oreno3d/characters/${params}?sort=${sort}&page=${page}`;
                },
            },
            {
                title: '标签搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-biao-qian-sou-suo',
                source: '/tags/:tagid',
                target: (params, url) => {
                    const sort = new URL(url).searchParams.get('sort') ?? 'hot';
                    const page = new URL(url).searchParams.get("page") ?? '1';
                    return `/tags/${params}?sort=${sort}&page=${page}`;
                },
            },
            {
                title: '原作搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-yuan-zuo-sou-suo',
                source: '/origins/:originid',
                target: (params, url) => {
                    const sort = new URL(url).searchParams.get('sort') ?? 'hot';
                    const page = new URL(url).searchParams.get("page") ?? '1';
                    return `/origins/${params}?sort=${sort}&page=${page}`;
                },
            },
        ],
    },
};
