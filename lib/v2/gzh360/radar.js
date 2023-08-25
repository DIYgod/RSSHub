module.exports = {
    'gzh360.com': {
        _name: '公众号360',
        web: [
            {
                title: '公众号',
                docs: 'https://docs.rsshub.app/routes/new-media#gong-zhong-hao-360',
                source: ['/gzh_articles', '/gzh', '/'],
                target: (params, url) => `/gzh360/gzh/${new URL(url).searchParams.get('id') ?? ''}`,
            },
            {
                title: '分类',
                docs: 'https://docs.rsshub.app/routes/new-media#gong-zhong-hao-360',
                source: ['/category', '/'],
                target: (params, url) => `/gzh360/category/${new URL(url).searchParams.get('id') ?? ''}`,
            },
        ],
    },
};
