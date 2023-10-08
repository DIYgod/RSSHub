module.exports = {
    'scmp.com': {
        _name: 'South China Morning Post',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/en/traditional-media#south-china-morning-post',
                source: ['/rss/:category_id/feed'],
                target: '/scmp/:category_id',
            },
        ],
    },
};
