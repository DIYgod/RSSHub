module.exports = {
    'guokr.com': {
        _name: '果壳网',
        '.': [
            {
                title: '科学人',
                docs: 'https://docs.rsshub.app/new-media.html#guo-ke-wang-ke-xue-ren',
                source: ['/scientific', '/'],
                target: '/guokr/scientific',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/new-media.html#guo-ke-wang-zhuan-lan',
                source: ['/'],
                target: '/guokr/:channel',
            },
        ],
    },
};
