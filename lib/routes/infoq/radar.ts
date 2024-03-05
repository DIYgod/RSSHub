export default {
    'infoq.cn': {
        _name: 'InfoQ 中文',
        '.': [
            {
                title: '推荐',
                docs: 'https://docs.rsshub.app/routes/new-media#infoq-zhong-wen',
                source: ['/'],
                target: '/infoq/recommend',
            },
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/routes/new-media#infoq-zhong-wen',
                source: ['/topic/:id'],
                target: '/infoq/topic/:id',
            },
        ],
    },
};
