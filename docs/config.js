docute.init({
    title: 'RSSHub',
    repo: 'DIYgod/RSSHub',
    twitter: 'DIYgod',
    'edit-link': 'https://github.com/DIYgod/RSSHub/tree/master/docs',
    nav: {
        default: [
            {
                title: '主页', path: '/'
            },
            {
                title: '支持 RSSHub', path: '/support'
            },
        ],
    },
    plugins: [
        docsearch({
            apiKey: '',
            indexName: 'rsshub',
            tags: ['zh-Hans'],
            url: 'https://rsshub.js.org'
        }),
    ]
});