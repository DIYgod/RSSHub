module.exports = {
    'cnki.net': {
        _name: '中国知网',
        navi: [
            {
                title: '期刊',
                docs: 'https://docs.rsshub.app/journal.html#zhong-guo-zhi-wang-qi-kan',
                source: ['/knavi/journals/:name/detail'],
                target: '/cnki/journals/:name',
            },
        ],
    },
};
