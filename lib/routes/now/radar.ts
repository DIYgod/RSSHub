export default {
    'news.now.com': {
        _name: 'Now 新聞',
        '.': [
            {
                title: '新聞',
                docs: 'https://docs.rsshub.app/routes/traditional-media#now-xin-wen',
                source: ['/'],
                target: '/now/news/:category?/:id?',
            },
        ],
    },
};
