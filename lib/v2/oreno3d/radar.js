module.exports = {
    'oreno3d.com': {
        _name: 'oreno3d',
        '.': [
            {
                title: '关键词搜索',
                docs: 'https://docs.rsshub.app/anime.html#oreno3d-an-の3dエロ-dong-hua-guan-jian-ci-sou-suo',
                source: '/search/:sort?/:keyword',
                target: '/oreno3d/users/:username?/video',
            },
            {
                title: '角色搜索',
                docs: 'https://docs.rsshub.app/anime.html#oreno3d-an-の3dエロ-dong-hua-jiao-se-sou-suo',
                source: '/characters/:sort?/:characterid',
                target: '/oreno3d/users/:username?/image',
            },
            {
                title: '作者搜索',
                docs: 'https://docs.rsshub.app/anime.html/anime.html#oreno3d-an-の3dエロ-dong-hua-zuo-zhe-sou-suo',
                source: '/authors/:sort?/:authorid',
                target: '/oreno3d/users/:username?/image',
            },
            {
                title: '标签搜索',
                docs: 'https://docs.rsshub.app/anime.html/anime.html#oreno3d-an-の3dエロ-dong-hua',
                source: '/tags/:sort?/:tagid',
                target: '/oreno3d/users/:username?/image',
            },
            {
                title: '原作搜索',
                docs: 'https://docs.rsshub.app/anime.html#oreno3d-an-の3dエロ-dong-hua-yuan-zuo-sou-suo',
                source: '/origins/:sort?/:originid',
                target: '/oreno3d/users/:username?/image',
            },
        ],
    },
};
