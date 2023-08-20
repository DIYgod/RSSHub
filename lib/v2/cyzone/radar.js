module.exports = {
    'cyzone.cn': {
        _name: '创业邦',
        '.': [
            {
                title: '资讯',
                docs: 'https://docs.rsshub.app/new-media.html#chuang-ye-bang-zi-xun',
                source: ['/channel/:id', '/'],
                target: '/cyzone/:id',
            },
            {
                title: '作者',
                docs: 'https://docs.rsshub.app/new-media.html#chuang-ye-bang-zuo-zhe',
                source: ['/author/:id', '/'],
                target: '/cyzone/author/:id',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/new-media.html#chuang-ye-bang-biao-qian',
                source: ['/label/:name', '/'],
                target: '/cyzone/label/:name',
            },
        ],
    },
};
