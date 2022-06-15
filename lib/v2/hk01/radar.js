module.exports = {
    'hk01.com': {
        _name: '香港01',
        www: [
            {
                title: '最 Hit',
                docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01',
                source: ['/hot', '/'],
                target: '/hk01/hot',
            },
            {
                title: 'zone',
                docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01',
                source: '/zone/:id/:title',
                target: '/hk01/zone/:id',
            },
            {
                title: 'channel',
                docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01',
                source: '/channel/:id/:title',
                target: '/hk01/channel/:id',
            },
            {
                title: 'issue',
                docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01',
                source: '/issue/:id/:title',
                target: '/hk01/issue/:id',
            },
            {
                title: 'tag',
                docs: 'https://docs.rsshub.app/traditional-media.html#xiang-gang-01',
                source: '/tag/:id/:title',
                target: '/hk01/tag/:id',
            },
        ],
    },
};
