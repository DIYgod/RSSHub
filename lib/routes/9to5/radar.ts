export default {
    '9to5toys.com': {
        _name: '9to5',
        '.': [
            {
                title: 'Toys 分站',
                docs: 'https://docs.rsshub.app/routes/new-media#9to5',
                source: ['/', '/guides/:tag'],
                target: '/9to5/toys/:tag?',
            },
        ],
    },
    '9to5mac.com': {
        _name: '9to5',
        '.': [
            {
                title: 'Mac 分站',
                docs: 'https://docs.rsshub.app/routes/new-media#9to5',
                source: ['/', '/guides/:tag'],
                target: '/9to5/mac/:tag?',
            },
        ],
    },
    '9to5google.com': {
        _name: '9to5',
        '.': [
            {
                title: 'Google 分站',
                docs: 'https://docs.rsshub.app/routes/new-media#9to5',
                source: ['/', '/guides/:tag'],
                target: '/9to5/google/:tag?',
            },
        ],
    },
};
