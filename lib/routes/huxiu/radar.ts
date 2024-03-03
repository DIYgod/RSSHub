export default {
    'huxiu.com': {
        _name: '虎嗅',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-zi-xun',
                source: ['/article'],
                target: '/huxiu/article',
            },
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-pin-dao',
                source: ['/channel'],
                target: (params) => `/huxiu/channel/${params.id.replace(/\.html$/, '')}`,
            },
            {
                title: '24小时',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-24-xiao-shi',
                source: ['/moment'],
                target: '/huxiu/moment',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-biao-qian',
                source: ['/tags/:id'],
                target: (params) => `/huxiu/tag/${params.id.replace(/\.html$/, '')}`,
            },
            {
                title: '搜索',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-sou-suo',
                source: ['/'],
                target: '/huxiu/search/:keyword',
            },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-zuo-zhe',
                source: ['/member/:id/:type'],
                target: (params) => `/huxiu/member/${params.id}/${params.type.replace(/\.html$/, '')}`,
            },
            {
                title: '文集',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-wen-ji',
                source: ['/collection/:id'],
                target: (params) => `/huxiu/collection/${params.id.replace(/\.html$/, '')}`,
            },
            {
                title: '简报',
                docs: 'https://docs.rsshub.app/routes/new-media#hu-xiu-jian-bao',
                source: ['/briefColumn/:id', '/'],
                target: (params) => `/huxiu/briefcolumn/${params.id.replace(/\.html$/, '')}`,
            },
        ],
    },
};
