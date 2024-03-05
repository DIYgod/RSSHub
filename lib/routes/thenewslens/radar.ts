export default {
    'thenewslens.com': {
        _name: 'The News Lens 關鍵評論',
        '.': [
            {
                title: '最新',
                docs: 'https://docs.rsshub.app/routes/new-media#the-news-lens-guan-jian-ping-lun',
                source: ['/latest-article/:sort?', '/'],
                target: '/thenewslens/latest-article/:sort?',
            },
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/new-media#the-news-lens-guan-jian-ping-lun',
                source: ['/news/:sort?', '/'],
                target: '/thenewslens/news/:sort?',
            },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/routes/new-media#the-news-lens-guan-jian-ping-lun',
                source: ['/author/:id/:sort?', '/'],
                target: '/thenewslens/author/:id/:sort?',
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#the-news-lens-guan-jian-ping-lun',
                source: ['/category/:id/:sort?', '/'],
                target: '/thenewslens/category/:id/:sort?',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/new-media#the-news-lens-guan-jian-ping-lun',
                source: ['/tag/:id/:sort?', '/'],
                target: '/thenewslens/tag/:id/:sort?',
            },
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/new-media#the-news-lens-guan-jian-ping-lun',
                source: ['/channel/:id/:sort?', '/'],
                target: '/thenewslens/channel/:id/:sort?',
            },
            {
                title: '评论',
                docs: 'https://docs.rsshub.app/routes/new-media#the-news-lens-guan-jian-ping-lun',
                source: ['/review/:sort?', '/'],
                target: '/thenewslens/review/:sort?',
            },
        ],
    },
};
