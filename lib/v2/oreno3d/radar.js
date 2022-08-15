module.exports = {
    'oreno3d.com': {
        _name: 'oreno3d',
        '.': [
            {
                title: '关键词搜索',
                docs: 'https://docs.rsshub.app/anime.htm#an-の3dエロ-dong-hua-oreno3d-guan-jian-ci-sou-suo',
                source: '/search?sort=:sort?&keyword=:keyword&page=pagelimit:',
                target: '/oreno3d/search/:keyword/:sort/:pagelimit?',
            },
            {
                title: '角色搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-jiao-se-sou-suo',
                source: '/characters/:characterid/?sort=:sort&page=pagelimit:',
                target: '/oreno3d/characters/:characterid/:sort/:pagelimit?',
            },
            {
                title: '作者搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-zuo-zhe-sou-suo',
                source: '/authors/:authorid/?sort=:sort&page=pagelimit:',
                target: '/oreno3d/authors/:authorid/:sort/:pagelimit?',
            },
            {
                title: '标签搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-biao-qian-sou-suo',
                source: '/tags/:tagid/?sort=:sort&page=pagelimit:',
                target: '/oreno3d/tags/:tagid/:sort?',
            },
            {
                title: '原作搜索',
                docs: 'https://docs.rsshub.app/anime.html#an-の3dエロ-dong-hua-oreno3d-yuan-zuo-sou-suo',
                source: '/origins/:originid/?sort=:sort&page=pagelimit:',
                target: '/oreno3d/origins/:originid/:sort?',
            },
        ],
    },
};
