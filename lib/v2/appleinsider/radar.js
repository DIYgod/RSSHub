module.exports = {
    'appleinsider.com': {
        _name: 'AppleInsider',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#appleinsider-fen-lei',
                source: ['/:category', '/'],
                target: '/appleinsider/:category',
            },
        ],
    },
};
