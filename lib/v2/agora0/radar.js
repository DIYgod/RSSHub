module.exports = {
    'github.io': {
        _name: 'GitHub',
        agorahub: [
            {
                title: '共和報',
                docs: 'https://docs.rsshub.app/new-media.html#ag0ra',
                source: ['/pen0'],
                target: '/agora0/pen0',
            },
        ],
    },
    'gitlab.io': {
        _name: 'GitLab',
        agora0: [
            {
                title: '零博客',
                docs: 'https://docs.rsshub.app/new-media.html#ag0ra',
                source: ['/blog/:category', '/'],
                target: '/agora0/:category',
            },
        ],
    },
};
