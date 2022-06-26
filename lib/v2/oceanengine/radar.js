module.exports = {
    'oceanengine.com': {
        _name: '巨量算数',
        trendinsight: [
            {
                title: '抖音/头条指数波峰',
                docs: 'https://docs.rsshub.app/other.html#ju-liang-suan-shu-suan-shu-zhi-shu',
                source: ['/arithmetic-index/analysis'],
                target: (params, url) => `/oceanengine/index/${new URL(url).searchParams.get('keyword')}`,
            },
        ],
    },
};
