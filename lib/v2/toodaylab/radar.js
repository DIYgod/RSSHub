module.exports = {
    'toodaylab.com': {
        _name: '理想生活实验室',
        '.': [
            {
                title: '滚动',
                docs: 'https://docs.rsshub.app/routes/new-media#li-xiang-sheng-huo-shi-yan-shi-gun-dong',
                source: ['/posts'],
                target: '/toodaylab/posts',
            },
            {
                title: '最热',
                docs: 'https://docs.rsshub.app/routes/new-media#li-xiang-sheng-huo-shi-yan-shi-zui-re',
                source: ['/posts'],
                target: '/toodaylab/hot',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/routes/new-media#li-xiang-sheng-huo-shi-yan-shi-zhuan-lan',
                source: ['/column/:id'],
                target: '/toodaylab/column/:id',
            },
            {
                title: '领域',
                docs: 'https://docs.rsshub.app/routes/new-media#li-xiang-sheng-huo-shi-yan-shi-ling-yu',
                source: ['/field/:id'],
                target: '/toodaylab/field/:id',
            },
            {
                title: '话题',
                docs: 'https://docs.rsshub.app/routes/new-media#li-xiang-sheng-huo-shi-yan-shi-hua-ti',
                source: ['/topic/:id'],
                target: '/toodaylab/topic/:id',
            },
        ],
    },
};
