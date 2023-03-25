module.exports = {
    'chsi.com.cn': {
        _name: '中国研究生招生信息网',
        yz: [
            {
                title: '考研热点新闻',
                docs: 'https://docs.rsshub.app/study.html#zhong-guo-yan-jiu-sheng-zhao-sheng-xin-xi-wang',
                source: ['/'],
                target: '/chsi/hotnews',
            },
            {
                title: '考研动态',
                docs: 'https://docs.rsshub.app/study.html#zhong-guo-yan-jiu-sheng-zhao-sheng-xin-xi-wang',
                source: ['/kyzx/kydt'],
                target: '/chsi/kydt',
            },
            {
                title: '考研资讯',
                docs: 'https://docs.rsshub.app/study.html#zhong-guo-yan-jiu-sheng-zhao-sheng-xin-xi-wang',
                source: ['/kyzx/:type'],
                target: '/chsi/kyzx/:type',
            },
        ],
    },
};
