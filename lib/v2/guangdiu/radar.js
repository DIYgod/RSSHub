module.exports = {
    'guangdiu.com': {
        _name: '逛丢',
        '.': [
            {
                title: '折扣',
                docs: 'https://docs.rsshub.app/other.html#gu-duo-shu-ju',
                source: ['/', '/cate.php'],
                target: (param, url) => `/guangdiu/${url.indexOf('?') > -1 ? url.split('?')[1] : ''}`,
            },
            {
                title: '一小时风云榜',
                docs: 'https://docs.rsshub.app/other.html#gu-duo-shu-ju',
                source: ['/rank'],
                target: '/guangdiu/rank',
            },
            {
                title: '九块九',
                docs: 'https://docs.rsshub.app/other.html#gu-duo-shu-ju',
                source: ['/cheaps.php'],
                target: (param, url) => `/guangdiu/${url.indexOf('?') > -1 ? url.split('?')[1] : ''}`,
            },
        ],
    },
};
