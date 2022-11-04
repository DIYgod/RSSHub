module.exports = {
    'theinitium.com': {
        _name: '端传媒',
        '.': [
            {
                title: '专题・栏目',
                docs: 'https://docs.rsshub.app/new-media.html#duan-chuan-mei',
                source: '/channel/:type',
                target: '/theinitium/channel/:type',
            },
            {
                title: '话题・标签',
                docs: 'https://docs.rsshub.app/new-media.html#duan-chuan-mei',
                source: '/tags/:type',
                target: '/theinitions/tags/:type',
            },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/new-media.html#duan-chuan-mei',
                source: '/author/:type',
                target: '/theinitium/author/:type',
            },
        ],
    },
};
