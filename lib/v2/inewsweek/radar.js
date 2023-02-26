module.exports = {
    'inewsweek.cn': {
        _name: '中国新闻周刊',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/traditional-media.html#zhong-guo-xin-wen-zhou-kan',
                source: ['/:channel', '/'],
                target: '/inewsweek/:channel',
            },
        ],
    },
};
