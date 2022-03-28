module.exports = {
    'segmentfault.com': {
        _name: 'SegmentFault',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/programming.html#segmentfault',
                source: ['/channel/:name'],
                target: '/channel/:name',
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/programming.html#segmentfault',
                source: ['/u/:name'],
                target: '/user/:name',
            },
        ],
    },
};
