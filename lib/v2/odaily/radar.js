module.exports = {
    'odaily.news': {
        _name: 'Odaily 星球日报',
        '.': [
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-kuai-xun',
                source: ['/newsflash', '/'],
                target: '/odaily/newsflash',
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-wen-zhang',
                source: ['/'],
                target: '/odaily/:id?',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-yong-hu-wen-zhang',
                source: ['/user/:id', '/'],
                target: '/odaily/user/:id',
            },
            {
                title: '活动',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-huo-dong',
                source: ['/activityPage', '/'],
                target: '/odaily/activity',
            },
        ],
    },
    '0daily.com': {
        _name: 'Odaily 星球日报',
        '.': [
            {
                title: '快讯',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-kuai-xun',
                source: ['/newsflash', '/'],
                target: '/odaily/newsflash',
            },
            {
                title: '文章',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-wen-zhang',
                source: ['/'],
                target: '/odaily/:id?',
            },
            {
                title: '用户文章',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-yong-hu-wen-zhang',
                source: ['/user/:id', '/'],
                target: '/odaily/user/:id',
            },
            {
                title: '活动',
                docs: 'https://docs.rsshub.app/new-media.html#odaily-xing-qiu-ri-bao-huo-dong',
                source: ['/activityPage', '/'],
                target: '/odaily/activity',
            },
        ],
    },
};
