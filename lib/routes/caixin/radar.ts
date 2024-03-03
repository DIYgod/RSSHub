export default {
    'caixin.com': {
        _name: '财新网',
        '.': [
            {
                title: '新闻分类',
                docs: 'https://docs.rsshub.app/routes/traditional-media#cai-xin-wang',
            },
            {
                title: '首页新闻',
                docs: 'https://docs.rsshub.app/routes/traditional-media#cai-xin-wang',
                source: ['/'],
                target: '/caixin/article',
            },
            {
                title: '最新文章',
                docs: 'https://docs.rsshub.app/routes/traditional-media#cai-xin-wang',
                source: ['/'],
                target: '/caixin/latest',
            },
            {
                title: '用户博客',
                docs: 'https://docs.rsshub.app/routes/blog#cai-xin-bo-ke',
            },
        ],
        database: [
            {
                title: '财新数据通',
                docs: 'https://docs.rsshub.app/routes/traditional-media#cai-xin-wang',
                source: ['/news', '/'],
                target: '/caixin/database',
            },
        ],
        k: [
            {
                title: '财新一线',
                docs: 'https://docs.rsshub.app/routes/traditional-media#cai-xin-wang',
                source: ['/web', '/'],
                target: '/caixin/database',
            },
        ],
        weekly: [
            {
                title: '财新周刊',
                docs: 'https://docs.rsshub.app/routes/traditional-media#cai-xin-wang',
                source: ['/', '/*'],
                target: '/caixin/weekly',
            },
        ],
    },
};
