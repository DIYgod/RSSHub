module.exports = {
    'sspai.com': {
        _name: '少数派',
        '.': [
            {
                title: '首页',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/index',
                target: '/sspai/index',
            },
            {
                title: '最新上架付费专栏',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/series',
                target: '/sspai/series',
            },
            {
                title: 'Matrix',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/matrix',
                target: '/sspai/matrix',
            },
            {
                title: '专栏',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/column/:id',
                target: '/sspai/column/:id',
            },
            {
                title: '作者动态',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/u/:id/updates',
                target: '/sspai/activity/:id',
            },
            {
                title: '作者已发布文章',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/u/:id/posts',
                target: '/sspai/author/:id',
            },
            {
                title: '专题',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/topics',
                target: '/sspai/topics',
            },
            {
                title: '专题内文章更新',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/topic/:id',
                target: '/sspai/topic/:id',
            },
            {
                title: '标签订阅',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: '/tag/:keyword',
                target: '/sspai/tag/:keyword',
            },
        ],
        shortcuts: [
            {
                title: 'Shortcuts Gallery',
                docs: 'https://docs.rsshub.app/new-media.html#shao-shu-pai-sspai',
                source: ['', '/*tpath'],
                target: '/sspai/shortcuts',
            },
        ],
    },
};
