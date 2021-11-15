module.exports = {
    '8world.com': {
        _name: '8视界',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#_8-shi-jie-fen-lei',
                source: ['/:category', '/'],
                target: '/8world/:category?',
            },
        ],
    },
};
