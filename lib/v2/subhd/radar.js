module.exports = {
    'subhd.tv': {
        _name: 'Sub HD',
        '.': [
            {
                title: '字幕',
                docs: 'https://docs.rsshub.app/multimedia.html#subhd-zi-mu',
                source: ['/sub/:category', '/'],
                target: '/subhd/sub/:category?',
            },
            {
                title: '字幕组',
                docs: 'https://docs.rsshub.app/multimedia.html#subhd-zi-mu-zu',
                source: ['/zu/:category', '/'],
                target: '/subhd/zu/:category?',
            },
        ],
    },
};
