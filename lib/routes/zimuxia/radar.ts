export default {
    'zimuxia.cn': {
        _name: 'FIX 字幕侠',
        '.': [
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/multimedia#fix-zi-mu-xia',
                source: ['/我们的作品'],
                target: (params, url) => `/zimuxia/${new URL(url).searchParams.get('cat')}`,
            },
            {
                title: '剧集',
                docs: 'https://docs.rsshub.app/routes/multimedia#fix-zi-mu-xia',
                source: ['/portfolio/:id'],
                target: '/zimuxia/portfolio/:id',
            },
        ],
    },
};
