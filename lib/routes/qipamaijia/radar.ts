export default {
    'qipamaijia.com': {
        _name: '奇葩买家秀',
        '.': [
            {
                title: '频道',
                docs: 'https://docs.rsshub.app/routes/reading#qi-dian-tu-shou-ding',
                source: ['/', '/:cate'],
                target: '/qipamaijia/:cate',
            },
        ],
    },
};
