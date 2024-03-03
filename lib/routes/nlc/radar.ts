export default {
    'nlc.cn': {
        _name: '中国国家图书馆',
        read: [
            {
                title: '读者云平台',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: (_, url) => {
                    url = new URL(url);
                    const type = url.searchParams.get('type');

                    return `/nlc/read/${type ? `/${type}` : ''}`;
                },
            },
            {
                title: '电子图书',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/电子图书',
            },
            {
                title: '电子期刊',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/电子期刊',
            },
            {
                title: '电子论文',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/电子论文',
            },
            {
                title: '电子报纸',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/电子报纸',
            },
            {
                title: '音视频',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/音视频',
            },
            {
                title: '标准专利',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/标准专利',
            },
            {
                title: '工具书',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/工具书',
            },
            {
                title: '少儿资源',
                docs: 'https://docs.rsshub.app/routes/other#zhong-guo-guo-jia-tu-shu-guan-du-zhe-yun-ping-tai',
                source: ['/outRes/outResList'],
                target: '/nlc/read/少儿资源',
            },
        ],
    },
};
