module.exports = {
    'oreno3d.com': {
        _name: 'oreno3d',
        '.': [
            {
                title: '关键词搜索',
                docs: 'https://docs.rsshub.app/anime.htm#an-の3dエロ-dong-hua-oreno3d-guan-jian-ci-sou-suo',
                source: '/search/:sort?/:keyword',
                target: '/oreno3d/users/:username?/video',
            },
            {
                title: '角色搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-jiao-se-sou-suo',
                source: '/characters/:sort?/:characterid',
                target: '/oreno3d/users/:username?/image',
            },
            {
                title: '作者搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-zuo-zhe-sou-suo',
                source: '/authors/:sort?/:authorid',
                target: '/oreno3d/users/:username?/image',
            },
            {
                title: '标签搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-biao-qian-sou-suo',
                source: '/tags/:sort?/:tagid',
                target: '/oreno3d/users/:username?/image',
            },
            {
                title: '原作搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-yuan-zuo-sou-suo',
                source: '/origins/:sort?/:originid',
                target: '/oreno3d/users/:username?/image',
            },
        ],
    },
};
