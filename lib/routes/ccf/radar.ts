export default {
    'ccf.org.cn': {
        _name: '中国计算机学会',
        '.': [
            {
                title: '新闻',
                docs: 'https://docs.rsshub.app/routes/study#zhong-guo-ji-suan-ji-xue-hui',
                source: ['/:category', '/'],
                target: '/ccf/news/:category',
            },
        ],
        ccfcv: [
            {
                title: '计算机视觉专委会 - 学术动态 - 学术前沿',
                docs: 'https://docs.rsshub.app/routes/study#zhong-guo-ji-suan-ji-xue-hui',
                source: ['/ccfcv/xsdt/xsqy/'],
                target: '/ccf/ccfcv/xsdt/xsqy',
            },
            {
                title: '计算机视觉专委会 - 学术动态 - 热点征文',
                docs: 'https://docs.rsshub.app/routes/study#zhong-guo-ji-suan-ji-xue-hui',
                source: ['/ccfcv/xsdt/rdzw/'],
                target: '/ccf/ccfcv/xsdt/rdzw',
            },
            {
                title: '计算机视觉专委会 - 学术动态 - 学术会议',
                docs: 'https://docs.rsshub.app/routes/study#zhong-guo-ji-suan-ji-xue-hui',
                source: ['/ccfcv/xsdt/xshy/'],
                target: '/ccf/ccfcv/xsdt/xshy',
            },
        ],
        tfbd: [
            {
                title: '大数据专家委员会',
                docs: 'https://docs.rsshub.app/routes/study#zhong-guo-ji-suan-ji-xue-hui',
                source: ['/tfbd/:caty/:id', '/'],
                target: '/ccf/tfbd/:caty/:id',
            },
        ],
    },
};
