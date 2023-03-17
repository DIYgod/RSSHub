module.exports = {
    'news.ptu.edu.cn': {
        _name: '莆田学院新闻网',
        '.': [
            {
                title: '莆院要闻',
                docs: 'https://docs.rsshub.app/shopping.html#pu-tian-xue-yuan',
                source: ['/:type/:pageId', '/'],
                target: '/ptu/news/:type/:pageId',
            },
            {
                title: '莆院快讯',
                docs: 'https://docs.rsshub.app/shopping.html#pu-tian-xue-yuan',
                source: ['/:type/:pageId', '/'],
                target: '/ptu/news/:type/:pageId',
            },
            {
                title: '媒体莆院',
                docs: 'https://docs.rsshub.app/university.html#pu-tian-xue-yuan',
                source: ['/:type/:id', '/'],
                target: '/ptu/news/:type/:pageId',
            },
        ],
    },
};
