export default {
    'lifeweek.com.cn': {
        _name: '三联生活周刊',
        '.': [
            {
                title: '栏目',
                docs: 'https://docs.rsshub.app/routes/traditional-media#san-lian-sheng-huo-zhou-kan',
                source: ['/column/:channel'],
                target: '/lifeweek/channel/:channel',
            },
            {
                title: '标签',
                docs: 'https://docs.rsshub.app/routes/traditional-media#san-lian-sheng-huo-zhou-kan',
                source: ['/articleList/:tag'],
                target: '/lifeweek/tag/:tag',
            },
        ],
    },
};
