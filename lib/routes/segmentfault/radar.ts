export default {
    'segmentfault.com': {
        _name: 'SegmentFault',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/programming#segmentfault',
                source: ['/channel/:name'],
                target: '/segmentfault/channel/:name',
            },
            {
                title: '用户',
                docs: 'https://docs.rsshub.app/routes/programming#segmentfault',
                source: ['/u/:name'],
                target: '/segmentfault/user/:name',
            },
            {
                title: '博客',
                docs: 'https://docs.rsshub.app/routes/programming#segmentfault',
                source: ['/t/:tag/blogs'],
                target: '/segmentfault/blogs/:tag',
            },
        ],
    },
};
