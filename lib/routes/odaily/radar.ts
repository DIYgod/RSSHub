const odaily = {
    _name: 'Odaily 星球日报',
    '.': [
        {
            title: '快讯',
            docs: 'https://docs.rsshub.app/routes/new-media#odaily-xing-qiu-ri-bao-kuai-xun',
            source: ['/newsflash', '/'],
            target: '/odaily/newsflash',
        },
        {
            title: '搜索快讯',
            docs: 'https://docs.rsshub.app/routes/new-media#odaily-xing-qiu-ri-bao-sou-suo-kuai-xun',
            source: ['/search/:keyword'],
            target: '/odaily/search/news/:keyword',
        },
        {
            title: '文章',
            docs: 'https://docs.rsshub.app/routes/new-media#odaily-xing-qiu-ri-bao-wen-zhang',
            source: ['/'],
            target: '/odaily/:id?',
        },
        {
            title: '用户文章',
            docs: 'https://docs.rsshub.app/routes/new-media#odaily-xing-qiu-ri-bao-yong-hu-wen-zhang',
            source: ['/user/:id', '/'],
            target: '/odaily/user/:id',
        },
        {
            title: '活动',
            docs: 'https://docs.rsshub.app/routes/new-media#odaily-xing-qiu-ri-bao-huo-dong',
            source: ['/activityPage', '/'],
            target: '/odaily/activity',
        },
    ],
};

export default {
    'odaily.news': odaily,
    '0daily.com': odaily,
};
