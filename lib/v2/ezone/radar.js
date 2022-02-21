module.exports = {
    'ezone.hk': {
        _name: 'ezone.hk',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#ezone-hk-fen-lei',
                source: ['/:category', '/'],
                target: '/ezone/:category?',
            },
        ],
    },
};
