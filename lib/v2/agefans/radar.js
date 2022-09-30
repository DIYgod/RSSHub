module.exports = {
    'agemys.cc': {
        _name: 'AGE动漫',
        '.': [
            {
                title: '最近更新',
                docs: 'https://docs.rsshub.app/anime.html#age-dong-man',
                source: ['/update', '/'],
                target: '/agefans/update',
            },
            {
                title: '番剧详情',
                docs: 'https://docs.rsshub.app/anime.html#age-dong-man',
                source: ['/detail/:id'],
                target: '/agefans/detail/:id',
            },
        ],
    },
};
