module.exports = {
    'worldjournal.com': {
        _name: '世界新聞網',
        '.': [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/new-media.html#shi-jie-xin-wen-wang',
                source: ['/wj/*path'],
                target: '/worldjournal/:path',
            },
        ],
    },
};
