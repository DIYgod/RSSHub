module.exports = {
    'segmentfault.com': {
        _name: 'SegmentFault',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/programming.html#segmentfault',
                source: ['/channel/:name'],
                target: '/segmentfault/channel/:name',
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/programming.html#segmentfault',
                source: ['/u/:name'],
                target: '/segmentfault/user/:name',
            },
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/programming.html#segmentfault',
                source: ['/t/:tag/blogs'],
                target: '/segmentfault/blogs/:tag',
            },
        ],
    },
};
