module.exports = {
    'eet-china.com': {
        _name: '电子工程专辑',
        '.': [
            {
                title: '芯语',
                docs: 'https://docs.rsshub.app/routes/new-media#dian-zi-gong-cheng-zhuan-ji-xin-yu',
                source: ['/mp', '/'],
                target: (params, url) => {
                    url = new URL(url);
                    const path = url.href.match(/\.com\/mp(.*?)/)[1];

                    return `/eet-china/mp${path ? `/${path}` : ''}`;
                },
            },
            {
                title: '芯语 - 标签',
                docs: 'https://docs.rsshub.app/routes/new-media#dian-zi-gong-cheng-zhuan-ji-xin-yu-biao-qian',
                source: ['/mp/tags/:id', '/'],
                target: '/eet-china/mp/tags/:id',
            },
        ],
    },
};
