export default {
    'gamme.com.tw': {
        _name: '卡卡洛普',
        news: [
            {
                title: '宅宅新聞 - 分類',
                docs: 'https://docs.rsshub.app/routes/new-media#ka-ka-luo-pu',
                source: ['/category/:category', '/'],
                target: (params) => `/gamme/news${params.category ? `/${params.category}` : ''}`,
            },
            {
                title: '宅宅新聞 - 標籤',
                docs: 'https://docs.rsshub.app/routes/new-media#ka-ka-luo-pu',
                source: ['/tag/:tag'],
                target: '/gamme/news/tag/:tag',
            },
        ],
        sexynews: [
            {
                title: '西斯新聞 - 分類',
                docs: 'https://docs.rsshub.app/routes/new-media#ka-ka-luo-pu',
                source: ['/category/:category', '/'],
                target: (params) => `/gamme/sexynews${params.category ? `/${params.category}` : ''}`,
            },
            {
                title: '西斯新聞 - 標籤',
                docs: 'https://docs.rsshub.app/routes/new-media#ka-ka-luo-pu',
                source: ['/tag/:tag'],
                target: '/gamme/sexynews/tag/:tag',
            },
        ],
    },
};
