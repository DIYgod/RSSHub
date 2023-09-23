module.exports = {
    'yysub.net': {
        _name: '人人影视',
        '.': [
            {
                title: '影视资讯',
                docs: 'https://docs.rsshub.app/routes/multimedia#ren-ren-ying-shi',
                source: '/article',
                target: (_params, url) => `/yyets/article${new URL(url).searchParams.has('type') ? '/' + new URL(url).searchParams.get('type') : ''}`,
            },
            {
                title: '今日播出',
                docs: 'https://docs.rsshub.app/routes/multimedia#ren-ren-ying-shi',
                source: ['/tv/schedule', '/'],
                target: '/yyets/today',
            },
        ],
    },
};
