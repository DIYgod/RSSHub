module.exports = {
    'tangshufang.com': {
        _name: '唐书房',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#tang-shu-fang-fen-lei',
                source: ['/:category', '/'],
                target: '/tangshufang/:category?',
            },
        ],
    },
};
