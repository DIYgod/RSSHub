module.exports = {
    'houxu.app': {
        _name: '后续',
        '.': [
            {
                title: '热点',
                docs: 'https://docs.rsshub.app/new-media.html#hou-xu-re-dian',
                source: ['/'],
                target: '/houxu',
            },
            {
                title: '跟踪',
                docs: 'https://docs.rsshub.app/new-media.html#hou-xu-gen-zong',
                source: ['/memory', '/'],
                target: '/houxu/memory',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/new-media.html#hou-xu-zhuan-lan',
                source: ['/events', '/'],
                target: '/houxu/events',
            },
            {
                title: 'Live',
                docs: 'https://docs.rsshub.app/new-media.html#hou-xu-live',
                source: ['/lives/:id', '/'],
                target: '/houxu/lives/:id',
            },
        ],
    },
};
