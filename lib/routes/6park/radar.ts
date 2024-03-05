export default {
    '6parkbbs.com': {
        _name: '留园网',
        club: [
            {
                title: '分站',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/:id/index.php', '/'],
                target: '/6park/:id?',
            },
            {
                title: '精华区',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/:id/index.php', '/'],
                target: '/6park/:id/gold',
            },
            {
                title: '搜索关键字',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/:id/index.php', '/'],
                target: (params, url) => `/6park/:id/keywords/${new URL(url).searchParams.get('keywords')}`,
            },
        ],
        local: [
            {
                title: '新闻栏目',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/index.php', '/'],
                target: (params, url) => `/6park/news/local/${new URL(url).searchParams.get('type_id')}`,
            },
            {
                title: '头条精选',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/index.php', '/'],
                target: '/6park/news/newspark/gold',
            },
            {
                title: '新闻搜索',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/index.php', '/'],
                target: (params, url) => `/6park/news/newspark/keywords/${new URL(url).searchParams.get('keywords')}`,
            },
        ],
        newspark: [
            {
                title: '新闻栏目',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/newspark/index.php', '/'],
                target: (params, url) => `/6park/news/newspark/${new URL(url).searchParams.get('type')}`,
            },
            {
                title: '头条精选',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/newspark/index.php', '/'],
                target: '/6park/news/newspark/gold',
            },
            {
                title: '新闻搜索',
                docs: 'https://docs.rsshub.app/routes/new-media#liu-yuan-wang',
                source: ['/newspark/index.php', '/'],
                target: (params, url) => `/6park/news/newspark/keywords/${new URL(url).searchParams.get('keywords')}`,
            },
        ],
    },
};
