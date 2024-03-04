export default {
    'taoguba.com.cn': {
        _name: '淘股吧',
        '.': [
            {
                title: '淘股论坛',
                docs: 'https://docs.rsshub.app/routes/finance#tao-gu-ba-tao-gu-lun-tan',
                source: ['/:category', '/'],
                target: '/taoguba/:category',
            },
            {
                title: '用户博客',
                docs: 'https://docs.rsshub.app/routes/finance#tao-gu-ba-yong-hu-bo-ke',
                source: ['/blog/:id', '/'],
                target: '/taoguba/blog/:id',
            },
        ],
    },
};
