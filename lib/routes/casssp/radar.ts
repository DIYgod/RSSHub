export default {
    'casssp.org.cn': {
        _name: '中国科学学与科技政策研究会',
        '.': [
            {
                title: '研究会动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-ke-xue-xue-yu-ke-ji-zheng-ce-yan-jiu-hui-yan-jiu-hui-dong-tai',
                source: ['/news/:category'],
                target: (params) => {
                    const category = params.category;

                    return `/casssp/news${category ? `/${category}` : ''}`;
                },
            },
            {
                title: '研究会动态 - 通知公告',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-ke-xue-xue-yu-ke-ji-zheng-ce-yan-jiu-hui-yan-jiu-hui-dong-tai',
                source: ['/news/3'],
                target: '/casssp/news/3',
            },
            {
                title: '研究会动态 - 新闻动态',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-ke-xue-xue-yu-ke-ji-zheng-ce-yan-jiu-hui-yan-jiu-hui-dong-tai',
                source: ['/news/2'],
                target: '/casssp/news/2',
            },
            {
                title: '研究会动态 - 信息公开',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-ke-xue-xue-yu-ke-ji-zheng-ce-yan-jiu-hui-yan-jiu-hui-dong-tai',
                source: ['/news/92'],
                target: '/casssp/news/92',
            },
            {
                title: '研究会动态 - 时政要闻',
                docs: 'https://docs.rsshub.app/routes/government#zhong-guo-ke-xue-xue-yu-ke-ji-zheng-ce-yan-jiu-hui-yan-jiu-hui-dong-tai',
                source: ['/news/93'],
                target: '/casssp/news/93',
            },
        ],
    },
};
