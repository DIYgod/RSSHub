export default {
    'pts.org.tw': {
        _name: '公視新聞網 PNN',
        news: [
            {
                title: '即時新聞',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-ji-shi-xin-wen',
                source: ['/dailynews', '/'],
                target: '/pts/dailynews',
            },
            {
                title: '專題策展',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-zhuan-ti-ce-zhan',
                source: ['/curations', '/'],
                target: '/pts/curations',
            },
            {
                title: '整理報導',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-zheng-li-bao-dao',
                source: ['/live/:id', '/'],
                target: '/pts/live/:id',
            },
            {
                title: '觀點',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-guan-dian',
                source: ['/opinion', '/'],
                target: '/pts/opinion',
            },
            {
                title: '數位敘事',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-shu-wei-xu-shi',
                source: ['/projects', '/'],
                target: '/pts/projects',
            },
            {
                title: '深度報導',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-shen-du-bao-dao',
                source: ['/report', '/'],
                target: '/pts/report',
            },
            {
                title: '分類',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-fen-lei',
                source: ['/category/:id', '/'],
                target: '/pts/category/:id',
            },
            {
                title: '標籤',
                docs: 'https://docs.rsshub.app/routes/traditional-media#gong-shi-xin-wen-wang-biao-qian',
                source: ['/tag/:id', '/'],
                target: '/pts/tag/:id',
            },
        ],
    },
};
