module.exports = {
    'cste.org.cn': {
        _name: '中国技术经济学会',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/study.html#zhong-guo-ji-shu-jing-ji-xue-hui-lan-mu',
                source: ['/site/term', '/'],
                target: (params, url) => `/cste/${new URL(url).match(/site\/term\/(\d+)\.html/)[1]}`,
            },
        ],
    },
};
