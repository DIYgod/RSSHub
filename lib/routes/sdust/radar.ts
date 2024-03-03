export default {
    'sdust.edu.cn': {
        _name: '山东科技大学',
        '.': [
            {
                title: '研究生招生网',
                docs: 'https://docs.rsshub.app/routes/university#shan-dong-ke-ji-da-xue-yan-jiu-sheng-zhao-sheng-wang',
                source: ['/zhaosheng', '/'],
                target: (params, url) => `/sdust/yjsy/zhaosheng/${new URL(url).href.match(/zhaosheng\/(.*)\.htm/)[1]}`,
            },
        ],
    },
};
