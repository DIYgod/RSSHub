export default {
    'scmp.com': {
        _name: 'South China Morning Post',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/traditional-media#south-china-morning-post',
                source: ['/rss/:category_id/feed'],
                target: '/scmp/:category_id',
            },
            {
                title: 'Topics',
                docs: 'https://docs.rsshub.app/routes/traditional-media#south-china-morning-post',
                source: ['/topics/:topic'],
                target: '/scmp/topics/:topic',
            },
        ],
    },
};
