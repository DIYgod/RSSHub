module.exports = {
    title: 'RSSHub',
    description: '🍰 万物皆可 RSS',
    ga: 'UA-48084758-10',
    serviceWorker: true,
    themeConfig: {
        repo: 'DIYgod/RSSHub',
        editLinks: true,
        editLinkText: '在 GitHub 上编辑此页',
        lastUpdated: '上次更新',
        serviceWorker: {
            updatePopup: {
                message: '发现新内容可用',
                buttonText: '刷新',
            },
        },
        docsDir: 'docs',
        nav: [
            {
                text: '使用',
                link: '/',
            },
            {
                text: '参与我们',
                link: '/joinus/',
            },
            {
                text: '部署',
                link: '/install/',
            },
            {
                text: '支持 RSSHub',
                link: '/support/',
            },
        ],
    },
};
