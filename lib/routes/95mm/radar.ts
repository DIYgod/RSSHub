export default {
    '95mm.org': {
        _name: 'MM范',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/picture#mm-fan-fen-lei',
                source: '/',
                target: '/95mm/tab/:tab?',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/picture#mm-fan-biao-qian',
                source: '/',
                target: '/95mm/tag/:tag',
            },
            {
                title: '集合',
                docs: 'https://docs.rsshub.app/routes/picture#mm-fan-ji-he',
                source: '/',
                target: '/95mm/category/:category',
            },
        ],
    },
};
