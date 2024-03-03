export default {
    'on.cc': {
        _name: '东网',
        hk: [
            {
                title: '港澳',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dong-wang',
                source: ['/hk/news/index.html', '/hk/news/index_cn.html'],
                target: '/oncc/zh-hans/news',
            },
            {
                title: '两岸',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dong-wang',
                source: ['/hk/cnnews/index.html', '/hk/cnnews/index_cn.html'],
                target: '/oncc/zh-hans/cnnews',
            },
            {
                title: '国际',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dong-wang',
                source: ['/hk/intnews/index.html', '/hk/intnews/index_cn.html'],
                target: '/oncc/zh-hans/intnews',
            },
            {
                title: '评论',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dong-wang',
                source: ['/hk/commentary/index.html', '/hk/commentary/index_cn.html'],
                target: '/oncc/zh-hans/commentary',
            },
            {
                title: '产经',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dong-wang',
                source: ['/hk/finance/index.html', '/hk/finance/index_cn.html'],
                target: '/oncc/zh-hans/finance',
            },
        ],
        money18: [
            {
                title: '產經',
                docs: 'https://docs.rsshub.app/routes/traditional-media#dong-wang',
                source: ['/finnews/news_breaking.html'],
                target: (params, url) => `/oncc/money18/${new URL(url).searchParams.get('section')}`,
            },
        ],
    },
};
