module.exports = {
    'storm.mg': {
        _name: '風傳媒',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/new-media.html#feng-chuan-mei',
                source: ['/:category/:id'],
                target: '/storm/:category?/:id?',
            },
        ],
    },
};
