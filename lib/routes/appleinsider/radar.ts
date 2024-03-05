export default {
    'appleinsider.com': {
        _name: 'AppleInsider',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#appleinsider-fen-lei',
                source: ['/:category', '/'],
                target: '/appleinsider/:category',
            },
        ],
    },
};
