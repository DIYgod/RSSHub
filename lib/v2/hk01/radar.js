module.exports = {
    'hk01.com': {
        _name: '香港01',
        '.': [
            {
                title: '热门',
                docs: 'https://docs.rsshub.app/new-media.html#xiang-gang-01-re-men',
                source: ['/hot', '/'],
                target: '/hk01/hot',
            },
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/new-media.html#xiang-gang-01-lan-mu',
                source: ['/zone/:id', '/'],
                target: '/hk01/zone/:id?',
            },
            {
                title: '子栏目',
                docs: 'https://docs.rsshub.app/new-media.html#xiang-gang-01-zi-lan-mu',
                source: ['/channel/:id', '/'],
                target: '/hk01/channel/:id?',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/new-media.html#xiang-gang-01-zhuan-ti',
                source: ['/issue/:id', '/'],
                target: '/hk01/issue/:id?',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#xiang-gang-01-biao-qian',
                source: ['/tag/:id', '/'],
                target: '/hk01/tag/:id?',
            },
            {
                title: '即時',
                docs: 'https://docs.rsshub.app/new-media.html#xiang-gang-01-ji-shi',
                source: ['/latest', '/'],
                target: '/hk01/latest',
            },
        ],
    },
};
