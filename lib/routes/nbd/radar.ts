export default {
    'nbd.com.cn': {
        _name: '每经网',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/finance#mei-jing-wang',
                source: ['/', '/columns/:id?'],
                target: '/nbd/:id?',
            },
            {
                title: '重磅原创',
                docs: 'https://docs.rsshub.app/routes/finance#mei-jing-wang',
                source: ['/', '/columns/332'],
                target: '/nbd/daily',
            },
        ],
    },
};
