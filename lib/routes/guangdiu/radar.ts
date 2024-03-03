export default {
    'guangdiu.com': {
        _name: '逛丢',
        '.': [
            {
                title: '折扣',
                docs: 'https://docs.rsshub.app/routes/shopping#guang-diu',
                source: ['/', '/cate.php'],
                target: (param, url) => `/guangdiu/${url.includes('?') ? url.split('?')[1] : ''}`,
            },
            {
                title: '一小时风云榜',
                docs: 'https://docs.rsshub.app/routes/shopping#guang-diu',
                source: ['/rank'],
                target: '/guangdiu/rank',
            },
            {
                title: '九块九',
                docs: 'https://docs.rsshub.app/routes/shopping#guang-diu',
                source: ['/cheaps.php'],
                target: (param, url) => `/guangdiu/${url.includes('?') ? url.split('?')[1] : ''}`,
            },
            {
                title: '关键字搜索',
                docs: 'https://docs.rsshub.app/routes/shopping#guang-diu',
                source: ['/search.php'],
                target: (param, url) => `/guangdiu/${url.includes('?') ? url.split('?')[1] : ''}`,
            },
        ],
    },
};
