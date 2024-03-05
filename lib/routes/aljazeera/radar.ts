export default {
    'aljazeera.com': {
        _name: 'Aljazeera 半岛电视台',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-xin-wen',
                source: ['/:category', '/'],
                target: '/aljazeera/english/:category',
            },
            {
                title: 'Tag',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-biao-qian',
                source: ['/tag/:id', '/'],
                target: '/aljazeera/english/tag/:id',
            },
            {
                title: 'Official RSS',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-guan-fang-rss',
                source: ['/xml/rss/all.xml', '/'],
                target: '/aljazeera/english/rss',
            },
        ],
    },
    'aljazeera.net': {
        _name: 'Aljazeera 半岛电视台',
        '.': [
            {
                title: 'News',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-xin-wen',
                source: ['/:category', '/'],
                target: '/aljazeera/arbric/:category',
            },
            {
                title: 'Tag',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-biao-qian',
                source: ['/tag/:id', '/'],
                target: '/aljazeera/arbric/tag/:id',
            },
            {
                title: 'Official RSS',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-guan-fang-rss',
                source: ['/rss', '/'],
                target: '/aljazeera/arbric/rss',
            },
        ],
        chinese: [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-xin-wen',
                source: ['/:category', '/'],
                target: '/aljazeera/chinese/:category',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/traditional-media#aljazeera-ban-dao-dian-shi-tai-biao-qian',
                source: ['/tag/:id', '/'],
                target: '/aljazeera/chinese/tag/:id',
            },
        ],
    },
};
