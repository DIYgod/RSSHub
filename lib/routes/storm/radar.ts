export default {
    'storm.mg': {
        _name: '風傳媒',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#feng-chuan-mei',
                source: ['/:category/:id'],
                target: '/storm/:category?/:id?',
            },
        ],
    },
};
