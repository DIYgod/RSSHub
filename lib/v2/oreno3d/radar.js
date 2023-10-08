module.exports = {
    'oreno3d.com': {
        _name: '俺の3Dエロ動画',
        '.': [
            {
                title: '关键词搜索',
                docs: 'https://docs.rsshub.app/routes/anime#an-の3dエロ-dong-hua-oreno3d-guan-jian-ci-sou-suo',
                source: ['/search'],
                target: (_params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/oreno3d/search/${searchParams.get('keyword')}${searchParams.has('sort') ? '/' + searchParams.get('sort') : ''}`;
                },
            },
            {
                title: '角色搜索',
                docs: 'https://docs.rsshub.app/routes/anime#an-の3dエロ-dong-hua-oreno3d-jiao-se-sou-suo',
                source: ['/characters/:characterid'],
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/oreno3d/characters/${params.characterid}${searchParams.has('sort') ? '/' + searchParams.get('sort') : ''}`;
                },
            },
            {
                title: '作者搜索',
                docs: 'https://docs.rsshub.app/routes/anime#an-の3dエロ-dong-hua-oreno3d-zuo-zhe-sou-suo',
                source: ['/authors/:authorid'],
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/oreno3d/authors/${params.authorid}${searchParams.has('sort') ? '/' + searchParams.get('sort') : ''}`;
                },
            },
            {
                title: '标签搜索',
                docs: 'https://docs.rsshub.app/routes/anime#an-の3dエロ-dong-hua-oreno3d-biao-qian-sou-suo',
                source: ['/tags/:tagid'],
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/oreno3d/tags/${params.tagid}${searchParams.has('sort') ? '/' + searchParams.get('sort') : ''}`;
                },
            },
            {
                title: '原作搜索',
                docs: 'https://docs.rsshub.app/routes/anime#an-の3dエロ-dong-hua-oreno3d-yuan-zuo-sou-suo',
                source: ['/origins/:originid'],
                target: (params, url) => {
                    const searchParams = new URL(url).searchParams;
                    return `/oreno3d/origins/${params.originid}${searchParams.has('sort') ? '/' + searchParams.get('sort') : ''}`;
                },
            },
        ],
    },
};
