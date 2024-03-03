const ageFans = {
    _name: 'AGE动漫',
    '.': [
        {
            title: '最近更新',
            docs: 'https://docs.rsshub.app/routes/anime#age-dong-man',
            source: ['/update', '/'],
            target: '/agefans/update',
        },
        {
            title: '番剧详情',
            docs: 'https://docs.rsshub.app/routes/anime#age-dong-man',
            source: ['/detail/:id'],
            target: '/agefans/detail/:id',
        },
    ],
};

export default {
    'agemys.cc': ageFans,
    'agemys.org': ageFans,
};
