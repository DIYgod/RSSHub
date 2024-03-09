export default {
    'cnki.net': {
        _name: '中国知网',
        navi: [
            {
                title: '期刊',
                docs: 'https://docs.rsshub.app/routes/journal#zhong-guo-zhi-wang-qi-kan',
                source: ['/knavi/journals/:name/detail'],
                target: '/cnki/journals/:name',
            },
            {
                title: '网络首发',
                docs: 'https://docs.rsshub.app/routes/journal#zhong-guo-zhi-wang-wang-luo-shou-fa',
                source: ['/knavi/journals/:name/detail'],
                target: '/cnki/journals/debut/:name',
            },
        ],
        kns: [
            {
                title: '作者期刊文献',
                docs: 'https://docs.rsshub.app/routes/journal#zhong-guo-zhi-wang-zuo-zhe-qi-kan-wen-xian',
                source: ['/kcms/detail/knetsearch.aspx', '/'],
                target: (_, url) => `/cnki/author/${new URL(url).searchParams.get('code')}`,
            },
        ],
    },
};
