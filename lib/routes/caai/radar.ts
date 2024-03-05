export default {
    'caai.cn': {
        _name: '中国人工智能学会',
        '.': [
            {
                title: '学会动态',
                docs: 'https://docs.rsshub.app/routes/study#zhong-guo-ren-gong-zhi-neng-xue-hui',
                source: ['/index.php'],
                target: (_, url) => `/caai/${url.match(/\/(\d+)\.html/)[1]}`,
            },
        ],
    },
};
